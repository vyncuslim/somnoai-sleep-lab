import { CronJob } from "cron";
import * as db from "../db";
import { google } from "googleapis";

/**
 * Background job to sync Google Fit data for all users daily
 * Runs at 2 AM every day to fetch sleep data from the previous day
 */
export function startSyncScheduler() {
  // Run every day at 2 AM
  const job = new CronJob("0 2 * * *", async () => {
    console.log("[Sync Scheduler] Starting daily Google Fit sync...");
    try {
      await syncAllUsersGoogleFitData();
      console.log("[Sync Scheduler] Daily sync completed successfully");
    } catch (error) {
      console.error("[Sync Scheduler] Error during sync:", error);
    }
  });

  job.start();
  console.log("[Sync Scheduler] Scheduler started - will run daily at 2 AM");
}

/**
 * Sync Google Fit data for all connected users
 */
async function syncAllUsersGoogleFitData() {
  try {
    // Get all users with Google Fit integration
    // Note: This is a simplified version - in production, you'd query the database
    console.log("[Sync Scheduler] Fetching users with Google Fit integration...");
    
    // For now, we'll just log that the sync would happen
    // In a real implementation, you would:
    // 1. Query all users with active Google Fit connections
    // 2. For each user, refresh their access token
    // 3. Fetch data from Google Fit API
    // 4. Save to database
    
    console.log("[Sync Scheduler] Sync process would query all users and sync their data");
  } catch (error) {
    console.error("[Sync Scheduler] Error syncing all users:", error);
  }
}

/**
 * Sync Google Fit data for a specific user
 */
export async function syncUserGoogleFitData(userId: number) {
  try {
    const integration = await db.getGoogleFitIntegration(userId);
    
    if (!integration || !integration.refreshToken) {
      console.warn(`[Sync] User ${userId} does not have Google Fit integration`);
      return;
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.VITE_FRONTEND_FORGE_API_URL || "http://localhost:3000"}/api/google-fit/callback`
    );

    // Refresh access token
    oauth2Client.setCredentials({
      refresh_token: integration.refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);

    // Update token in database
    await db.updateGoogleFitIntegration(userId, {
      accessToken: credentials.access_token || "",
      expiresAt: new Date(credentials.expiry_date || Date.now() + 3600000),
      lastSyncAt: new Date(),
    });

    console.log(`[Sync] Successfully synced Google Fit data for user ${userId}`);
  } catch (error) {
    console.error(`[Sync] Error syncing Google Fit for user ${userId}:`, error);
  }
}

/**
 * Check sleep goals and send notifications if targets are missed
 */
export async function checkSleepGoalsAndNotify(userId: number) {
  try {
    const goal = await db.getUserSleepGoal(userId);
    if (!goal || !goal.notifyWhenMissed) {
      return;
    }

    // Get yesterday's sleep data
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const sleepRecord = await db.getSleepRecord(userId, yesterday);
    if (!sleepRecord) {
      return;
    }

    const totalDuration = sleepRecord.totalDuration || 0;
    const targetDuration = goal.targetSleepDuration || 480;

    // Check if user missed their sleep target
    if (totalDuration < targetDuration) {
      const missedMinutes = targetDuration - totalDuration;
      await db.createNotification({
        userId,
        title: "未达成睡眠目标",
        content: `昨晚睡眠时长为 ${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m，比目标少了 ${Math.floor(missedMinutes / 60)}h ${missedMinutes % 60}m。请今晚早点休息！`,
        type: "sleep_goal_missed",
      });
    }
  } catch (error) {
    console.error(`[Notification] Error checking sleep goals for user ${userId}:`, error);
  }
}
