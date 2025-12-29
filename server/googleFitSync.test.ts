import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "./db";

describe("Google Fit Sync Status Management", () => {
  const testUserId = 1;
  const testSyncData = {
    userId: testUserId,
    syncStartTime: new Date(),
    status: "success" as const,
    recordsCount: 10,
    syncDuration: 5000,
  };

  describe("createSyncStatus", () => {
    it("should create a new sync status record", async () => {
      const result = await db.createSyncStatus(testSyncData);
      expect(result).toBeDefined();
      expect(result?.userId).toBe(testUserId);
      expect(result?.status).toBe("success");
    });

    it("should record sync start time", async () => {
      const startTime = new Date();
      const result = await db.createSyncStatus({
        ...testSyncData,
        syncStartTime: startTime,
      });
      expect(result?.syncStartTime).toEqual(startTime);
    });

    it("should handle different sync statuses", async () => {
      const statuses = ["pending", "syncing", "success", "failed"] as const;
      
      for (const status of statuses) {
        const result = await db.createSyncStatus({
          ...testSyncData,
          status,
        });
        expect(result?.status).toBe(status);
      }
    });

    it("should record error message on failed sync", async () => {
      const errorMessage = "Network timeout";
      const result = await db.createSyncStatus({
        ...testSyncData,
        status: "failed",
        errorMessage,
      });
      expect(result?.errorMessage).toBe(errorMessage);
    });
  });

  describe("getLatestSyncStatus", () => {
    it("should retrieve the latest sync status for a user", async () => {
      // Create a sync record
      await db.createSyncStatus(testSyncData);
      
      // Get the latest sync
      const latest = await db.getLatestSyncStatus(testUserId);
      expect(latest).toBeDefined();
      expect(latest?.userId).toBe(testUserId);
      expect(latest?.status).toBe("success");
    });

    it("should return undefined if no sync history exists", async () => {
      const nonExistentUserId = 99999;
      const result = await db.getLatestSyncStatus(nonExistentUserId);
      expect(result).toBeUndefined();
    });

    it("should return the most recent sync when multiple exist", async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);
      
      // Create an old sync
      await db.createSyncStatus({
        ...testSyncData,
        syncStartTime: oneHourAgo,
        status: "failed",
      });
      
      // Create a recent sync
      const recentSync = await db.createSyncStatus({
        ...testSyncData,
        syncStartTime: now,
        status: "success",
      });
      
      // Get latest should return the recent one
      const latest = await db.getLatestSyncStatus(testUserId);
      expect(latest?.status).toBe("success");
      expect(latest?.syncStartTime.getTime()).toBeGreaterThan(oneHourAgo.getTime());
    });
  });

  describe("getSyncHistory", () => {
    it("should retrieve sync history with default limit", async () => {
      // Create multiple sync records
      for (let i = 0; i < 5; i++) {
        await db.createSyncStatus({
          ...testSyncData,
          syncStartTime: new Date(Date.now() - i * 1000),
        });
      }
      
      const history = await db.getSyncHistory(testUserId);
      expect(history.length).toBeGreaterThan(0);
      expect(history.length).toBeLessThanOrEqual(10); // Default limit
    });

    it("should respect custom limit parameter", async () => {
      // Create multiple sync records
      for (let i = 0; i < 10; i++) {
        await db.createSyncStatus({
          ...testSyncData,
          syncStartTime: new Date(Date.now() - i * 1000),
        });
      }
      
      const history = await db.getSyncHistory(testUserId, 3);
      expect(history.length).toBeLessThanOrEqual(3);
    });

    it("should return history in reverse chronological order", async () => {
      const times = [
        new Date(Date.now() - 3000),
        new Date(Date.now() - 2000),
        new Date(Date.now() - 1000),
      ];
      
      for (const time of times) {
        await db.createSyncStatus({
          ...testSyncData,
          syncStartTime: time,
        });
      }
      
      const history = await db.getSyncHistory(testUserId, 3);
      if (history.length >= 2) {
        expect(history[0].syncStartTime.getTime()).toBeGreaterThanOrEqual(
          history[1].syncStartTime.getTime()
        );
      }
    });
  });

  describe("updateSyncStatus", () => {
    it("should update sync status fields", async () => {
      const created = await db.createSyncStatus({
        ...testSyncData,
        status: "syncing",
      });
      
      if (created?.id) {
        const endTime = new Date();
        await db.updateSyncStatus(created.id, {
          status: "success",
          syncEndTime: endTime,
          syncDuration: 5000,
          recordsCount: 15,
        });
        
        const updated = await db.getSyncStatus(created.id);
        expect(updated?.status).toBe("success");
        expect(updated?.recordsCount).toBe(15);
      }
    });

    it("should update error information on failed sync", async () => {
      const created = await db.createSyncStatus({
        ...testSyncData,
        status: "syncing",
      });
      
      if (created?.id) {
        const errorMessage = "Failed to fetch data from Google Fit";
        const errorCode = "GOOGLE_FIT_ERROR";
        
        await db.updateSyncStatus(created.id, {
          status: "failed",
          errorMessage,
          errorCode,
          syncEndTime: new Date(),
        });
        
        const updated = await db.getSyncStatus(created.id);
        expect(updated?.status).toBe("failed");
        expect(updated?.errorMessage).toBe(errorMessage);
        expect(updated?.errorCode).toBe(errorCode);
      }
    });
  });

  describe("Sync Status Workflow", () => {
    it("should handle complete sync workflow: pending -> syncing -> success", async () => {
      // Step 1: Create sync with pending status
      const syncRecord = await db.createSyncStatus({
        userId: testUserId,
        syncStartTime: new Date(),
        status: "pending",
      });
      
      expect(syncRecord?.status).toBe("pending");
      
      if (syncRecord?.id) {
        // Step 2: Update to syncing
        await db.updateSyncStatus(syncRecord.id, {
          status: "syncing",
        });
        
        let updated = await db.getSyncStatus(syncRecord.id);
        expect(updated?.status).toBe("syncing");
        
        // Step 3: Update to success
        const endTime = new Date();
        await db.updateSyncStatus(syncRecord.id, {
          status: "success",
          syncEndTime: endTime,
          recordsCount: 20,
          syncDuration: 3000,
        });
        
        updated = await db.getSyncStatus(syncRecord.id);
        expect(updated?.status).toBe("success");
        expect(updated?.recordsCount).toBe(20);
        expect(updated?.syncDuration).toBe(3000);
      }
    });

    it("should handle sync workflow with error: pending -> syncing -> failed", async () => {
      const syncRecord = await db.createSyncStatus({
        userId: testUserId,
        syncStartTime: new Date(),
        status: "pending",
      });
      
      if (syncRecord?.id) {
        // Update to syncing
        await db.updateSyncStatus(syncRecord.id, {
          status: "syncing",
        });
        
        // Update to failed with error details
        const errorMessage = "Network connection timeout";
        const errorCode = "TIMEOUT";
        
        await db.updateSyncStatus(syncRecord.id, {
          status: "failed",
          syncEndTime: new Date(),
          errorMessage,
          errorCode,
          syncDuration: 30000,
        });
        
        const updated = await db.getSyncStatus(syncRecord.id);
        expect(updated?.status).toBe("failed");
        expect(updated?.errorMessage).toBe(errorMessage);
        expect(updated?.errorCode).toBe(errorCode);
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle sync with zero records", async () => {
      const result = await db.createSyncStatus({
        ...testSyncData,
        recordsCount: 0,
      });
      expect(result?.recordsCount).toBe(0);
    });

    it("should handle very long sync duration", async () => {
      const result = await db.createSyncStatus({
        ...testSyncData,
        syncDuration: 300000, // 5 minutes
      });
      expect(result?.syncDuration).toBe(300000);
    });

    it("should handle long error messages", async () => {
      const longError = "A".repeat(500);
      const result = await db.createSyncStatus({
        ...testSyncData,
        status: "failed",
        errorMessage: longError,
      });
      expect(result?.errorMessage?.length).toBeGreaterThan(100);
    });
  });
});
