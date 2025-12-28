import { google } from "googleapis";
import * as db from "../db";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID || "",
  process.env.GOOGLE_CLIENT_SECRET || "",
  `${process.env.VITE_FRONTEND_FORGE_API_URL}/api/oauth/google/callback`
);

/**
 * Get authorization URL for Google Fit
 */
export function getGoogleFitAuthUrl() {
  const scopes = [
    "https://www.googleapis.com/auth/fitness.sleep.read",
    "https://www.googleapis.com/auth/fitness.heart_rate.read",
    "https://www.googleapis.com/auth/fitness.body.read",
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });

  return url;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    throw error;
  }
}

/**
 * Get sleep data from Google Fit
 */
export async function getSleepData(userId: number, startTimeMillis: number, endTimeMillis: number) {
  try {
    const integration = await db.getGoogleFitIntegration(userId);
    if (!integration || !integration.accessToken) {
      throw new Error("Google Fit integration not found");
    }

    oauth2Client.setCredentials({
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken || undefined,
    });

    const fitness = google.fitness({ version: "v1", auth: oauth2Client });

    const response = await fitness.users.dataset.aggregate({
      userId: "me",
      requestBody: {
        aggregateBy: [
          {
            dataTypeName: "com.google.android.gms.sleep.segment",
          },
        ],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis,
        endTimeMillis,
      },
    } as any);

    return response.data;
  } catch (error) {
    console.error("Error getting sleep data from Google Fit:", error);
    throw error;
  }
}

/**
 * Get heart rate data from Google Fit
 */
export async function getHeartRateData(userId: number, startTimeMillis: number, endTimeMillis: number) {
  try {
    const integration = await db.getGoogleFitIntegration(userId);
    if (!integration || !integration.accessToken) {
      throw new Error("Google Fit integration not found");
    }

    oauth2Client.setCredentials({
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken || undefined,
    });

    const fitness = google.fitness({ version: "v1", auth: oauth2Client });

    const response = await fitness.users.dataset.aggregate({
      userId: "me",
      requestBody: {
        aggregateBy: [
          {
            dataTypeName: "com.google.heart_rate.bpm",
          },
        ],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis,
        endTimeMillis,
      },
    } as any);

    return response.data;
  } catch (error) {
    console.error("Error getting heart rate data from Google Fit:", error);
    throw error;
  }
}

/**
 * Sync Google Fit data to database
 */
export async function syncGoogleFitData(userId: number) {
  try {
    const integration = await db.getGoogleFitIntegration(userId);
    if (!integration || !integration.accessToken) {
      throw new Error("Google Fit integration not found");
    }

    const endTime = Date.now();
    const startTime = endTime - 30 * 24 * 60 * 60 * 1000;

    const sleepData = await getSleepData(userId, startTime, endTime);
    const heartRateData = await getHeartRateData(userId, startTime, endTime);

    if (sleepData.bucket) {
      for (const bucket of sleepData.bucket) {
        if (bucket.dataset && bucket.dataset.length > 0) {
          for (const dataset of bucket.dataset) {
            if (dataset.point && dataset.point.length > 0) {
              for (const point of dataset.point) {
                const recordDate = new Date(parseInt(point.startTimeNanos || "0") / 1000000);
                recordDate.setHours(0, 0, 0, 0);

                const startTimeMs = parseInt(point.startTimeNanos || "0") / 1000000;
                const endTimeMs = parseInt(point.endTimeNanos || "0") / 1000000;
                const totalDuration = Math.round((endTimeMs - startTimeMs) / 60000);

                const existingRecord = await db.getSleepRecord(userId, recordDate);
                if (!existingRecord) {
                  await db.createSleepRecord({
                    userId,
                    recordDate,
                    totalDuration,
                    source: "google_fit",
                    googleFitId: `${point.startTimeNanos}-${point.endTimeNanos}`,
                  });
                }
              }
            }
          }
        }
      }
    }

    await db.updateGoogleFitIntegration(userId, {
      lastSyncAt: new Date(),
    });

    return { success: true, message: "Google Fit data synced successfully" };
  } catch (error) {
    console.error("Error syncing Google Fit data:", error);
    throw error;
  }
}
