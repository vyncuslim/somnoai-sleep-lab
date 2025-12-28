import { getDb } from "../db";
import { sleepRecords, heartRateData } from "../../drizzle/schema";

/**
 * 从 Google Fit 获取睡眠数据（模拟数据）
 * 注：真实实现需要配置 Google OAuth 2.0 和 Fitness API
 */
export async function fetchGoogleFitSleepData(
  accessToken: string,
  startTime: Date,
  endTime: Date
) {
  try {
    // 这里应该调用 Google Fit API
    // 为了演示，返回模拟数据
    const sleepData = [
      {
        startTimeMillis: startTime.getTime().toString(),
        endTimeMillis: new Date(startTime.getTime() + 8 * 60 * 60 * 1000).getTime().toString(),
        value: 3, // 深睡
      },
    ];

    return sleepData;
  } catch (error) {
    console.error("Error fetching Google Fit sleep data:", error);
    throw error;
  }
}

/**
 * 从 Google Fit 获取心率数据（模拟数据）
 */
export async function fetchGoogleFitHeartRateData(
  accessToken: string,
  startTime: Date,
  endTime: Date
) {
  try {
    // 这里应该调用 Google Fit API
    // 为了演示，返回模拟数据
    const heartRateData = [
      {
        startTimeMillis: startTime.getTime().toString(),
        endTimeMillis: new Date(startTime.getTime() + 24 * 60 * 60 * 1000).getTime().toString(),
        value: 72, // 平均心率
      },
    ];

    return heartRateData;
  } catch (error) {
    console.error("Error fetching Google Fit heart rate data:", error);
    throw error;
  }
}

/**
 * 同步 Google Fit 数据到数据库
 */
export async function syncGoogleFitData(
  userId: number,
  accessToken: string,
  startDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  endDate: Date = new Date()
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection not available");
  }

  try {
    // 获取睡眠数据
    const sleepDataList = await fetchGoogleFitSleepData(
      accessToken,
      startDate,
      endDate
    );

    // 获取心率数据
    const heartRateDataList = await fetchGoogleFitHeartRateData(
      accessToken,
      startDate,
      endDate
    );

    // 处理睡眠数据
    for (const sleep of sleepDataList) {
      const startTime = parseInt(sleep.startTimeMillis);
      const endTime = parseInt(sleep.endTimeMillis);
      const duration = (endTime - startTime) / (1000 * 60); // 转换为分钟

      const recordDate = new Date(startTime);
      recordDate.setHours(0, 0, 0, 0);

      // 计算睡眠评分和阶段
      const sleepScore = calculateSleepScore(duration, sleep.value);
      const sleepStage = getSleepStage(sleep.value);

      // 保存或更新睡眠记录
      const sleepRecord: any = {
        userId,
        recordDate,
        sleepScore: sleepScore.toString(),
        totalDuration: Math.round(duration / 60), // 转换为小时
        source: "google_fit",
        googleFitId: `${sleep.startTimeMillis}-${sleep.endTimeMillis}`,
      };
      sleepRecord[sleepStage] = Math.round(duration);

      await db
        .insert(sleepRecords)
        .values(sleepRecord)
        .onDuplicateKeyUpdate({
          set: sleepRecord,
        });
    }

    // 处理心率数据
    for (const hr of heartRateDataList) {
      const startTime = parseInt(hr.startTimeMillis);
      const recordDate = new Date(startTime);
      recordDate.setHours(0, 0, 0, 0);

      // 保存或更新心率记录
      await db
        .insert(heartRateData)
        .values({
          userId,
          recordDate,
          averageHeartRate: Math.round(hr.value),
          minHeartRate: Math.round(hr.value * 0.9),
          maxHeartRate: Math.round(hr.value * 1.1),
          source: "google_fit",
        })
        .onDuplicateKeyUpdate({
          set: {
            averageHeartRate: Math.round(hr.value),
          },
        });
    }

    return {
      success: true,
      sleepRecordsCount: sleepDataList.length,
      heartRateRecordsCount: heartRateDataList.length,
    };
  } catch (error) {
    console.error("Error syncing Google Fit data:", error);
    throw error;
  }
}

/**
 * 计算睡眠评分
 */
function calculateSleepScore(durationMinutes: number, sleepStage: number): number {
  // 基础评分：根据睡眠时长
  let score = 0;
  if (durationMinutes >= 480) score = 90; // 8 小时以上
  else if (durationMinutes >= 420) score = 85; // 7 小时
  else if (durationMinutes >= 360) score = 75; // 6 小时
  else if (durationMinutes >= 300) score = 60; // 5 小时
  else score = 40; // 少于 5 小时

  // 根据睡眠阶段调整评分
  if (sleepStage === 3) score += 5; // 深睡
  else if (sleepStage === 4) score += 3; // REM
  else if (sleepStage === 2) score += 1; // 浅睡

  return Math.min(100, score);
}

/**
 * 获取睡眠阶段字段名称
 */
function getSleepStage(
  stageValue: number
): "deepSleepDuration" | "remDuration" | "lightSleepDuration" | "awakeDuration" {
  switch (stageValue) {
    case 3:
      return "deepSleepDuration";
    case 4:
      return "remDuration";
    case 2:
      return "lightSleepDuration";
    case 1:
    default:
      return "awakeDuration";
  }
}
