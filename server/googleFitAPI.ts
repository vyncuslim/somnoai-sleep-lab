/**
 * Google Fit API 调用工具函数
 * 用于获取用户的健身数据（步数、活动、睡眠、心率等）
 */

import axios from "axios";

const GOOGLE_FIT_API_BASE = "https://www.googleapis.com/fitness/v1/users/me";

interface GoogleFitDataPoint {
  startTimeNanos: string;
  endTimeNanos: string;
  value: Array<{
    intVal?: number;
    fpVal?: number;
    stringVal?: string;
    mapVal?: Record<string, any>;
  }>;
}

interface GoogleFitDataset {
  point: GoogleFitDataPoint[];
}

interface GoogleFitResponse {
  bucket: Array<{
    startTimeMillis: string;
    endTimeMillis: string;
    dataset: GoogleFitDataset[];
  }>;
}

/**
 * 获取步数数据
 * @param accessToken Google Fit API 的 access token
 * @param startTimeMillis 开始时间（毫秒）
 * @param endTimeMillis 结束时间（毫秒）
 */
export async function getStepCount(
  accessToken: string,
  startTimeMillis: number,
  endTimeMillis: number
): Promise<GoogleFitResponse | null> {
  try {
    const response = await axios.post(
      `${GOOGLE_FIT_API_BASE}/dataset:aggregate`,
      {
        aggregateBy: [
          {
            dataTypeName: "com.google.step_count.delta",
            dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
          },
        ],
        bucketByTime: { durationMillis: 86400000 }, // 1 day
        startTimeMillis,
        endTimeMillis,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to get step count:", error);
    return null;
  }
}

/**
 * 获取活动类型数据
 * @param accessToken Google Fit API 的 access token
 * @param startTimeMillis 开始时间（毫秒）
 * @param endTimeMillis 结束时间（毫秒）
 */
export async function getActivitySegments(
  accessToken: string,
  startTimeMillis: number,
  endTimeMillis: number
): Promise<GoogleFitResponse | null> {
  try {
    const response = await axios.post(
      `${GOOGLE_FIT_API_BASE}/dataset:aggregate`,
      {
        aggregateBy: [
          {
            dataTypeName: "com.google.activity.segment",
            dataSourceId: "derived:com.google.activity.segment:com.google.android.gms:merge_activity_segments",
          },
        ],
        bucketByTime: { durationMillis: 86400000 }, // 1 day
        startTimeMillis,
        endTimeMillis,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to get activity segments:", error);
    return null;
  }
}

/**
 * 获取睡眠阶段数据
 * @param accessToken Google Fit API 的 access token
 * @param startTimeMillis 开始时间（毫秒）
 * @param endTimeMillis 结束时间（毫秒）
 */
export async function getSleepSegments(
  accessToken: string,
  startTimeMillis: number,
  endTimeMillis: number
): Promise<GoogleFitResponse | null> {
  try {
    const response = await axios.post(
      `${GOOGLE_FIT_API_BASE}/dataset:aggregate`,
      {
        aggregateBy: [
          {
            dataTypeName: "com.google.sleep.segment",
            dataSourceId: "derived:com.google.sleep.segment:com.google.android.gms:merged",
          },
        ],
        bucketByTime: { durationMillis: 86400000 }, // 1 day
        startTimeMillis,
        endTimeMillis,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to get sleep segments:", error);
    return null;
  }
}

/**
 * 获取心率数据
 * @param accessToken Google Fit API 的 access token
 * @param startTimeMillis 开始时间（毫秒）
 * @param endTimeMillis 结束时间（毫秒）
 */
export async function getHeartRate(
  accessToken: string,
  startTimeMillis: number,
  endTimeMillis: number
): Promise<GoogleFitResponse | null> {
  try {
    const response = await axios.post(
      `${GOOGLE_FIT_API_BASE}/dataset:aggregate`,
      {
        aggregateBy: [
          {
            dataTypeName: "com.google.heart_rate.bpm",
            dataSourceId: "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm",
          },
        ],
        bucketByTime: { durationMillis: 86400000 }, // 1 day
        startTimeMillis,
        endTimeMillis,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to get heart rate:", error);
    return null;
  }
}

/**
 * 获取所有健身数据（步数、活动、睡眠、心率）
 * @param accessToken Google Fit API 的 access token
 * @param startTimeMillis 开始时间（毫秒）
 * @param endTimeMillis 结束时间（毫秒）
 */
export async function getAllFitnessData(
  accessToken: string,
  startTimeMillis: number,
  endTimeMillis: number
) {
  try {
    const [steps, activities, sleep, heartRate] = await Promise.all([
      getStepCount(accessToken, startTimeMillis, endTimeMillis),
      getActivitySegments(accessToken, startTimeMillis, endTimeMillis),
      getSleepSegments(accessToken, startTimeMillis, endTimeMillis),
      getHeartRate(accessToken, startTimeMillis, endTimeMillis),
    ]);

    return {
      steps,
      activities,
      sleep,
      heartRate,
      startTime: new Date(startTimeMillis),
      endTime: new Date(endTimeMillis),
    };
  } catch (error) {
    console.error("Failed to get all fitness data:", error);
    return null;
  }
}

/**
 * 解析步数数据
 */
export function parseStepCount(data: GoogleFitResponse | null): number[] {
  if (!data || !data.bucket) return [];

  return data.bucket.map((bucket) => {
    if (bucket.dataset && bucket.dataset.length > 0) {
      const dataset = bucket.dataset[0];
      if (dataset.point && dataset.point.length > 0) {
        const point = dataset.point[0];
        return point.value[0]?.intVal || 0;
      }
    }
    return 0;
  });
}

/**
 * 解析活动数据
 */
export function parseActivitySegments(data: GoogleFitResponse | null): Array<{
  activity: string;
  startTime: Date;
  endTime: Date;
  duration: number;
}> {
  if (!data || !data.bucket) return [];

  const activities: Array<{
    activity: string;
    startTime: Date;
    endTime: Date;
    duration: number;
  }> = [];

  data.bucket.forEach((bucket) => {
    if (bucket.dataset && bucket.dataset.length > 0) {
      bucket.dataset.forEach((dataset) => {
        if (dataset.point) {
          dataset.point.forEach((point) => {
            const startTime = new Date(parseInt(point.startTimeNanos) / 1000000);
            const endTime = new Date(parseInt(point.endTimeNanos) / 1000000);
            const duration = endTime.getTime() - startTime.getTime();

            // 活动类型编码
            const activityCode = point.value[0]?.intVal || 0;
            const activityMap: Record<number, string> = {
              0: "未知",
              1: "步行",
              2: "跑步",
              3: "骑自行车",
              4: "静止",
              5: "运动",
              7: "驾驶",
              8: "健身房",
            };

            activities.push({
              activity: activityMap[activityCode] || "其他",
              startTime,
              endTime,
              duration,
            });
          });
        }
      });
    }
  });

  return activities;
}

/**
 * 解析睡眠数据
 */
export function parseSleepSegments(data: GoogleFitResponse | null): Array<{
  stage: string;
  startTime: Date;
  endTime: Date;
  duration: number;
}> {
  if (!data || !data.bucket) return [];

  const sleepSegments: Array<{
    stage: string;
    startTime: Date;
    endTime: Date;
    duration: number;
  }> = [];

  data.bucket.forEach((bucket) => {
    if (bucket.dataset && bucket.dataset.length > 0) {
      bucket.dataset.forEach((dataset) => {
        if (dataset.point) {
          dataset.point.forEach((point) => {
            const startTime = new Date(parseInt(point.startTimeNanos) / 1000000);
            const endTime = new Date(parseInt(point.endTimeNanos) / 1000000);
            const duration = endTime.getTime() - startTime.getTime();

            // 睡眠阶段编码
            const stageCode = point.value[0]?.intVal || 0;
            const stageMap: Record<number, string> = {
              1: "浅睡眠",
              2: "深睡眠",
              3: "快速眼动睡眠",
              4: "清醒",
            };

            sleepSegments.push({
              stage: stageMap[stageCode] || "未知",
              startTime,
              endTime,
              duration,
            });
          });
        }
      });
    }
  });

  return sleepSegments;
}

/**
 * 解析心率数据
 */
export function parseHeartRate(data: GoogleFitResponse | null): Array<{
  bpm: number;
  startTime: Date;
  endTime: Date;
}> {
  if (!data || !data.bucket) return [];

  const heartRateData: Array<{
    bpm: number;
    startTime: Date;
    endTime: Date;
  }> = [];

  data.bucket.forEach((bucket) => {
    if (bucket.dataset && bucket.dataset.length > 0) {
      bucket.dataset.forEach((dataset) => {
        if (dataset.point) {
          dataset.point.forEach((point) => {
            const startTime = new Date(parseInt(point.startTimeNanos) / 1000000);
            const endTime = new Date(parseInt(point.endTimeNanos) / 1000000);
            const bpm = point.value[0]?.fpVal || 0;

            heartRateData.push({
              bpm: Math.round(bpm),
              startTime,
              endTime,
            });
          });
        }
      });
    }
  });

  return heartRateData;
}
