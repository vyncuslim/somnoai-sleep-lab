import { Router, Request, Response } from "express";
import { google } from "googleapis";
import * as db from "../db";
import { upsertUser } from "../db";

const router = Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.VITE_FRONTEND_FORGE_API_URL}/api/oauth/google/callback`
);

/**
 * Google OAuth Callback Handler
 * 处理 Google OAuth 授权后的回调
 */
router.get("/api/oauth/google/callback", async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Missing authorization code" });
    }

    // 交换授权码获取访问令牌
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // 获取用户信息
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    const { email, name, id: googleId } = userInfo.data;

    // 创建或更新用户
    await upsertUser({
      openId: googleId || email || "unknown",
      email: email,
      name: name,
      loginMethod: "google",
      lastSignedIn: new Date(),
    });

    // 获取用户信息以获取 ID
    const user = await db.getUserByOpenId(googleId || email || "unknown");
    if (!user) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    // 保存 Google Fit 集成信息
    const existingIntegration = await db.getGoogleFitIntegration(user.id);
    if (existingIntegration) {
      await db.updateGoogleFitIntegration(user.id, {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
        lastSyncAt: new Date(),
      });
    } else {
      await db.createGoogleFitIntegration({
        userId: user.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
        lastSyncAt: new Date(),
      });
    }

    // 同步 Google Fit 数据
    await syncGoogleFitData(user.id, oauth2Client);

    // 创建会话 cookie（如果需要）
    // 这里可以根据您的认证系统来处理

    // 重定向到首页
    res.redirect("/");
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

/**
 * 同步 Google Fit 数据
 */
async function syncGoogleFitData(userId: number, auth: any) {
  try {
    const fitness = google.fitness({ version: "v1", auth });

    // 获取过去 30 天的睡眠数据
    const endTime = Date.now();
    const startTime = endTime - 30 * 24 * 60 * 60 * 1000;

    // 获取睡眠数据
    const sleepResponse = await fitness.users.dataset.aggregate({
      userId: "me",
      requestBody: {
        aggregateBy: [
          {
            dataTypeName: "com.google.android.gms.sleep.segment",
          },
        ],
        bucketByTime: { durationMillis: 86400000 }, // 1 day
        startTimeMillis: startTime,
        endTimeMillis: endTime,
      },
    } as any);

    // 处理睡眠数据
    if (sleepResponse.data.bucket) {
      for (const bucket of sleepResponse.data.bucket) {
        if (bucket.dataset && bucket.dataset.length > 0) {
          for (const dataset of bucket.dataset) {
            if (dataset.point && dataset.point.length > 0) {
              for (const point of dataset.point) {
                const recordDate = new Date(parseInt(point.startTimeNanos || "0") / 1000000);
                recordDate.setHours(0, 0, 0, 0);

                const startTimeMs = parseInt(point.startTimeNanos || "0") / 1000000;
                const endTimeMs = parseInt(point.endTimeNanos || "0") / 1000000;
                const totalDuration = Math.round((endTimeMs - startTimeMs) / 60000);

                // 检查是否已存在记录
                const existingRecord = await db.getSleepRecord(userId, recordDate);
                if (!existingRecord) {
                  await db.createSleepRecord({
                    userId,
                    recordDate,
                    totalDuration,
                    source: "google_fit",
                  });
                }
              }
            }
          }
        }
      }
    }

    // 获取心率数据
    const heartRateResponse = await fitness.users.dataset.aggregate({
      userId: "me",
      requestBody: {
        aggregateBy: [
          {
            dataTypeName: "com.google.heart_rate.bpm",
          },
        ],
        bucketByTime: { durationMillis: 86400000 }, // 1 day
        startTimeMillis: startTime,
        endTimeMillis: endTime,
      },
    } as any);

    // 处理心率数据
    if (heartRateResponse.data.bucket) {
      for (const bucket of heartRateResponse.data.bucket) {
        if (bucket.dataset && bucket.dataset.length > 0) {
          for (const dataset of bucket.dataset) {
            if (dataset.point && dataset.point.length > 0) {
              const recordDate = new Date(parseInt(dataset.point[0].startTimeNanos || "0") / 1000000);
              recordDate.setHours(0, 0, 0, 0);

              // 计算平均、最低、最高心率
              const heartRates = dataset.point.map((p: any) => p.value?.[0]?.fpVal || 0);
              const averageHeartRate = Math.round(
                heartRates.reduce((a: number, b: number) => a + b, 0) / heartRates.length
              );
              const minHeartRate = Math.min(...heartRates);
              const maxHeartRate = Math.max(...heartRates);

              // 检查是否已存在记录
              const existingRecord = await db.getHeartRateData(userId, recordDate);
              if (!existingRecord) {
                await db.createHeartRateData({
                  userId,
                  recordDate,
                  averageHeartRate,
                  minHeartRate,
                  maxHeartRate,
                  source: "google_fit",
                });
              }
            }
          }
        }
      }
    }

    console.log(`Successfully synced Google Fit data for user ${userId}`);
  } catch (error) {
    console.error("Error syncing Google Fit data:", error);
  }
}

export default router;
