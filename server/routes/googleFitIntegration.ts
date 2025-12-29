import { Router, Request, Response } from "express";
import { google } from "googleapis";
import * as db from "../db";
import { sdk } from "../_core/sdk";

const router = Router();

// 中间件：为所有路由添加用户认证
router.use(async (req: Request, res: Response, next) => {
  try {
    const user = await sdk.authenticateRequest(req);
    (req as any).user = user;
  } catch (error) {
    // 用户未认证，但继续处理
    (req as any).user = null;
  }
  next();
});

// 获取应用的正确 URL
const getRedirectUri = () => {
  // 在生产环境中使用应用的实际 URL
  if (process.env.NODE_ENV === 'production') {
    // 从请求中动态获取主机名
    return 'https://somnoai-lab-bvvlgs8k.manus.space/api/google-fit/callback';
  }
  return 'http://localhost:3000/api/google-fit/callback';
};

let oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  getRedirectUri()
);

// 在每个请求时更新重定向 URI
const updateRedirectUri = (req: Request) => {
  const host = req.get('host');
  const protocol = req.protocol || 'https';
  const redirectUri = `${protocol}://${host}/api/google-fit/callback`;
  oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
};

/**
 * 获取 Google Fit 授权 URL
 */
router.get("/api/google-fit/auth-url", async (req: Request, res: Response) => {
  try {
    // 检查用户是否已认证
    let userId = (req as any).user?.id;
    
    // 如果中间件没有设置用户，尝试直接认证
    if (!userId) {
      try {
        const user = await sdk.authenticateRequest(req);
        userId = user.id;
      } catch (error) {
        return res.status(401).json({ error: "User not authenticated" });
      }
    }
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    updateRedirectUri(req);
    const scopes = [
      "https://www.googleapis.com/auth/fitness.sleep.read",
      "https://www.googleapis.com/auth/fitness.heart_rate.read",
      "https://www.googleapis.com/auth/fitness.body.read",
      "https://www.googleapis.com/auth/fitness.activity.read",
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
      state: JSON.stringify({ userId }),
    });

    res.json({ authUrl });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    res.status(500).json({ error: "Failed to generate auth URL" });
  }
})

/**
 * Google Fit OAuth 回调处理
 */
router.get("/api/google-fit/callback", async (req: Request, res: Response) => {
  try {
    // 更新重定向 URI 以确保一致性
    updateRedirectUri(req);
    
    const { code, state, error } = req.query;

    if (!code) {
      return res.redirect("/?google_fit_error=missing_code");
    }

    // 获取用户 ID（从 state 参数或 session）
    let userId = (req as any).user?.id;
    if (!userId && state) {
      try {
        const stateData = JSON.parse(state as string);
        userId = stateData.userId;
      } catch (e) {
        console.error("Failed to parse state:", e);
      }
    }

    // 如果没有 userId，使用默认访客用户 ID
    if (!userId) {
      userId = 1; // Default guest user
    }

    if (!userId) {
      return res.redirect("/?google_fit_error=not_authenticated");
    }

    // 交换授权码获取访问令牌
    console.log("[Google Fit] Attempting to exchange auth code");
    console.log("[Google Fit] Auth code:", typeof code === 'string' ? code.substring(0, 20) + "..." : "missing");
    
    let tokens;
    try {
      const response = await oauth2Client.getToken(code as string);
      tokens = response.tokens;
      console.log("[Google Fit] Successfully exchanged auth code for tokens");
    } catch (tokenError) {
      console.error("[Google Fit] Failed to exchange auth code:", tokenError);
      if (tokenError instanceof Error) {
        console.error("[Google Fit] Error details:", tokenError.message);
      }
      console.error("[Google Fit] Redirect URI:", "[private]");
      console.error("[Google Fit] Request host:", req.get('host'));
      console.error("[Google Fit] Request protocol:", req.protocol);
      return res.redirect("/?google_fit_error=token_exchange_failed");
    }
    
    if (!tokens || !tokens.access_token) {
      console.error("[Google Fit] No access token in response");
      return res.redirect("/?google_fit_error=no_access_token");
    }
    
    oauth2Client.setCredentials(tokens);

    // 保存 Google Fit 集成信息
    const existingIntegration = await db.getGoogleFitIntegration(userId);
    const tokenExpiry = tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600000);
    
    if (existingIntegration) {
      await db.updateGoogleFitIntegration(userId, {
        accessToken: tokens.access_token || "",
        refreshToken: tokens.refresh_token || existingIntegration.refreshToken,
        tokenExpiry: tokenExpiry,
        lastSyncAt: new Date(),
        isConnected: 1,
      });
    } else {
      await db.createGoogleFitIntegration({
        userId,
        accessToken: tokens.access_token || "",
        refreshToken: tokens.refresh_token,
        tokenExpiry: tokenExpiry,
        lastSyncAt: new Date(),
        isConnected: 1,
      });
    }

    // 同步 Google Fit 数据
    await syncGoogleFitData(userId, oauth2Client);

    // 重定向到首页
    res.redirect("/?google_fit_connected=true");
  } catch (error) {
    console.error("[Google Fit] Callback error:", error);
    if (error instanceof Error) {
      console.error("[Google Fit] Error message:", error.message);
      console.error("[Google Fit] Error stack:", error.stack);
    }
    res.redirect("/?google_fit_error=callback_error");
  }
});

/**
 * 手动同步 Google Fit 数据
 */
router.post("/api/google-fit/sync", async (req: Request, res: Response) => {
  try {
    let userId = (req as any).user?.id;
    
    // 如果中间件没有设置用户，尝试直接认证
    if (!userId) {
      try {
        const user = await sdk.authenticateRequest(req);
        userId = user.id;
      } catch (error) {
        return res.status(401).json({ error: "User not authenticated" });
      }
    }
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const integration = await db.getGoogleFitIntegration(userId);
    if (!integration) {
      return res.status(400).json({ error: "Google Fit not connected" });
    }

    // 刷新访问令牌
    oauth2Client.setCredentials({
      refresh_token: integration.refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);

    // 同步数据
    await syncGoogleFitData(userId, oauth2Client);

    res.json({ success: true, message: "Data synced successfully" });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ error: "Failed to sync data" });
  }
});

/**
 * 获取 Google Fit 集成状态
 */
router.get("/api/google-fit/status", async (req: Request, res: Response) => {
  try {
    let userId = (req as any).user?.id;
    
    // 如果中间件没有设置用户，尝试直接认证
    if (!userId) {
      try {
        const user = await sdk.authenticateRequest(req);
        userId = user.id;
      } catch (error) {
        return res.status(401).json({ error: "User not authenticated" });
      }
    }
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const integration = await db.getGoogleFitIntegration(userId);
    res.json({
      isConnected: !!integration,
      lastSyncAt: integration?.lastSyncAt,
      syncStatus: integration ? "idle" : "disconnected",
    });
  } catch (error) {
    console.error("Status error:", error);
    res.status(500).json({ error: "Failed to get status" });
  }
});

/**
 * 同步 Google Fit 数据
 */
async function syncGoogleFitData(userId: number, auth: any) {
  try {
    const fitness = google.fitness({ version: "v1", auth });

    // 获取过去 30 天的数据
    const endTime = Date.now();
    const startTime = endTime - 30 * 24 * 60 * 60 * 1000;

    // 获取睡眠数据
    try {
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

      if (sleepResponse.data.bucket) {
        for (const bucket of sleepResponse.data.bucket) {
          if (bucket.dataset && bucket.dataset.length > 0) {
            for (const dataset of bucket.dataset) {
              if (dataset.point && dataset.point.length > 0) {
                for (const point of dataset.point) {
                  const recordDate = new Date(
                    parseInt(point.startTimeNanos || "0") / 1000000
                  );
                  recordDate.setHours(0, 0, 0, 0);

                  const startTimeMs =
                    parseInt(point.startTimeNanos || "0") / 1000000;
                  const endTimeMs =
                    parseInt(point.endTimeNanos || "0") / 1000000;
                  const totalDuration = Math.round(
                    (endTimeMs - startTimeMs) / 60000
                  );

                  // 检查是否已存在记录
                  const existingRecord = await db.getSleepRecord(
                    userId,
                    recordDate
                  );
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
    } catch (error) {
      console.warn("Failed to sync sleep data:", error);
    }

    // 获取心率数据
    try {
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

      if (heartRateResponse.data.bucket) {
        for (const bucket of heartRateResponse.data.bucket) {
          if (bucket.dataset && bucket.dataset.length > 0) {
            for (const dataset of bucket.dataset) {
              if (dataset.point && dataset.point.length > 0) {
                const recordDate = new Date(
                  parseInt(dataset.point[0].startTimeNanos || "0") / 1000000
                );
                recordDate.setHours(0, 0, 0, 0);

                // 计算平均、最低、最高心率
                const heartRates = dataset.point.map(
                  (p: any) => p.value?.[0]?.fpVal || 0
                );
                const averageHeartRate = Math.round(
                  heartRates.reduce((a: number, b: number) => a + b, 0) /
                    heartRates.length
                );
                const minHeartRate = Math.min(...heartRates);
                const maxHeartRate = Math.max(...heartRates);

                // 检查是否已存在记录
                const existingRecord = await db.getHeartRateData(
                  userId,
                  recordDate
                );
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
    } catch (error) {
      console.warn("Failed to sync heart rate data:", error);
    }

    console.log(`Successfully synced Google Fit data for user ${userId}`);
  } catch (error) {
    console.error("Error syncing Google Fit data:", error);
  }
}

export default router;
