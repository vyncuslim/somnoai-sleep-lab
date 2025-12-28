import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { googleFitIntegrations } from "../../drizzle/schema";
import axios from "axios";

interface GoogleFitCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

const GOOGLE_FIT_API_BASE = "https://www.googleapis.com/fitness/v1/users/me";

/**
 * 获取 Google Fit 睡眠数据
 * 返回指定日期范围内的睡眠段数据
 */
export async function getGoogleFitSleepData(
  credentials: GoogleFitCredentials,
  startTime: number,
  endTime: number
) {
  try {
    const response = await axios.post(
      `${GOOGLE_FIT_API_BASE}/dataset:aggregate`,
      {
        aggregateBy: [
          {
            dataTypeName: "com.google.android.gms.sleep_segment",
          },
        ],
        bucketByTime: { durationMillis: 86400000 }, // 1 day
        startTimeMillis: startTime,
        endTimeMillis: endTime,
      },
      {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const sleepData: any[] = [];

    if (response.data.bucket) {
      for (const bucket of response.data.bucket) {
        if (bucket.dataset && bucket.dataset.length > 0) {
          for (const dataset of bucket.dataset) {
            if (dataset.point) {
              for (const point of dataset.point) {
                const startMs = parseInt(point.startTimeNanos || "0") / 1000000;
                const endMs = parseInt(point.endTimeNanos || "0") / 1000000;
                const sleepType = point.value?.[0]?.intVal || 0;

                sleepData.push({
                  startTime: new Date(startMs),
                  endTime: new Date(endMs),
                  sleepType: getSleepStageName(sleepType),
                  duration: (endMs - startMs) / 1000 / 60, // 分钟
                });
              }
            }
          }
        }
      }
    }

    return sleepData;
  } catch (error) {
    console.error("Failed to get Google Fit sleep data:", error);
    throw error;
  }
}

/**
 * 获取 Google Fit 心率数据
 * 返回指定日期范围内的心率数据
 */
export async function getGoogleFitHeartRateData(
  credentials: GoogleFitCredentials,
  startTime: number,
  endTime: number
) {
  try {
    const response = await axios.post(
      `${GOOGLE_FIT_API_BASE}/dataset:aggregate`,
      {
        aggregateBy: [
          {
            dataTypeName: "com.google.android.gms.heart_rate.bpm",
          },
        ],
        bucketByTime: { durationMillis: 3600000 }, // 1 hour
        startTimeMillis: startTime,
        endTimeMillis: endTime,
      },
      {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const heartRateData: any[] = [];

    if (response.data.bucket) {
      for (const bucket of response.data.bucket) {
        if (bucket.dataset && bucket.dataset.length > 0) {
          for (const dataset of bucket.dataset) {
            if (dataset.point) {
              for (const point of dataset.point) {
                const timeMs = parseInt(point.startTimeNanos || "0") / 1000000;
                const bpm = point.value?.[0]?.fpVal || 0;

                if (bpm > 0) {
                  heartRateData.push({
                    timestamp: new Date(timeMs),
                    bpm: Math.round(bpm),
                  });
                }
              }
            }
          }
        }
      }
    }

    return heartRateData;
  } catch (error) {
    console.error("Failed to get Google Fit heart rate data:", error);
    throw error;
  }
}

/**
 * 同步 Google Fit 数据到数据库
 */
export async function syncGoogleFitData(
  userId: number,
  credentials: GoogleFitCredentials,
  startDate: Date,
  endDate: Date
) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    // 获取睡眠和心率数据
    const [sleepData, heartRateData] = await Promise.all([
      getGoogleFitSleepData(credentials, startTime, endTime),
      getGoogleFitHeartRateData(credentials, startTime, endTime),
    ]);

    // 处理睡眠数据
    let totalSleepTime = 0;
    const sleepStages: Record<string, number> = {
      DEEP: 0,
      LIGHT: 0,
      REM: 0,
      AWAKE: 0,
    };

    for (const sleep of sleepData) {
      totalSleepTime += sleep.duration;
      sleepStages[sleep.sleepType] = (sleepStages[sleep.sleepType] || 0) + sleep.duration;
    }

    // 处理心率数据
    let avgHeartRate = 0;
    let minHeartRate = Infinity;
    let maxHeartRate = 0;

    if (heartRateData.length > 0) {
      const totalBpm = heartRateData.reduce((sum, hr) => sum + hr.bpm, 0);
      avgHeartRate = Math.round(totalBpm / heartRateData.length);
      minHeartRate = Math.min(...heartRateData.map((hr) => hr.bpm));
      maxHeartRate = Math.max(...heartRateData.map((hr) => hr.bpm));
    }

    // 更新同步状态
    const result = await db
      .select()
      .from(googleFitIntegrations)
      .where(eq(googleFitIntegrations.userId, userId))
      .limit(1);

    if (result.length > 0) {
      // 更新现有记录
        await db
          .update(googleFitIntegrations)
          .set({
            lastSyncAt: new Date(),
          })
          .where(eq(googleFitIntegrations.userId, userId));
    } else {
      // 创建新记录
      await db.insert(googleFitIntegrations).values({
        userId,
        accessToken: credentials.accessToken,
        refreshToken: credentials.refreshToken,
        lastSyncAt: new Date(),
      });
    }

    return {
      success: true,
      sleepData: {
        totalTime: totalSleepTime,
        stages: sleepStages,
      },
      heartRateData: {
        average: avgHeartRate,
        min: minHeartRate === Infinity ? 0 : minHeartRate,
        max: maxHeartRate,
      },
    };
  } catch (error) {
    console.error("Failed to sync Google Fit data:", error);

    // 更新同步失败状态
    const db = await getDb();
    if (db) {
      const result = await db
        .select()
        .from(googleFitIntegrations)
        .where(eq(googleFitIntegrations.userId, userId))
        .limit(1);

      if (result.length > 0) {
        await db
          .update(googleFitIntegrations)
          .set({
            lastSyncAt: new Date(),
          })
          .where(eq(googleFitIntegrations.userId, userId));
      } else {
        await db.insert(googleFitIntegrations).values({
          userId,
          accessToken: credentials.accessToken || "",
          lastSyncAt: new Date(),
        });
      }
    }

    throw error;
  }
}

/**
 * 获取睡眠阶段名称
 */
function getSleepStageName(stageValue: number): string {
  switch (stageValue) {
    case 1:
      return "AWAKE";
    case 2:
      return "LIGHT";
    case 3:
      return "DEEP";
    case 4:
      return "REM";
    default:
      return "UNKNOWN";
  }
}

/**
 * 获取同步状态
 */
export async function getSyncStatus(userId: number) {
  try {
    const db = await getDb();
    if (!db) {
      return null;
    }

    const result = await db
      .select()
      .from(googleFitIntegrations)
      .where(eq(googleFitIntegrations.userId, userId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Failed to get sync status:", error);
    return null;
  }
}
