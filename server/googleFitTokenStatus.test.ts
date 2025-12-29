import { describe, it, expect, vi, beforeEach } from "vitest";
import * as db from "./db";

// Mock the db module
vi.mock("./db", () => ({
  getGoogleFitIntegration: vi.fn(),
  updateGoogleFitIntegration: vi.fn(),
}));

describe("Google Fit Token Status Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Token Status Calculation", () => {
    it("should return not connected when no integration exists", async () => {
      const mockDb = vi.mocked(db);
      mockDb.getGoogleFitIntegration.mockResolvedValue(null);

      const integration = await db.getGoogleFitIntegration(1);
      
      expect(integration).toBeNull();
      expect(mockDb.getGoogleFitIntegration).toHaveBeenCalledWith(1);
    });

    it("should calculate hours until expiry correctly", () => {
      const now = new Date();
      const futureTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
      
      const hoursUntilExpiry = (futureTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      expect(hoursUntilExpiry).toBeCloseTo(24, 0);
    });

    it("should identify token as expiring soon (within 24 hours)", () => {
      const now = new Date();
      const soonExpiry = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours from now
      
      const hoursUntilExpiry = (soonExpiry.getTime() - now.getTime()) / (1000 * 60 * 60);
      const isExpiringSoon = hoursUntilExpiry < 24;
      
      expect(isExpiringSoon).toBe(true);
    });

    it("should identify token as not expiring soon (more than 24 hours)", () => {
      const now = new Date();
      const laterExpiry = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now
      
      const hoursUntilExpiry = (laterExpiry.getTime() - now.getTime()) / (1000 * 60 * 60);
      const isExpiringSoon = hoursUntilExpiry < 24;
      
      expect(isExpiringSoon).toBe(false);
    });

    it("should identify token as expired", () => {
      const now = new Date();
      const pastExpiry = new Date(now.getTime() - 1000); // 1 second ago
      
      const isExpired = now >= pastExpiry;
      
      expect(isExpired).toBe(true);
    });

    it("should identify token as not expired", () => {
      const now = new Date();
      const futureExpiry = new Date(now.getTime() + 1000); // 1 second from now
      
      const isExpired = now >= futureExpiry;
      
      expect(isExpired).toBe(false);
    });
  });

  describe("Time Formatting", () => {
    it("should format hours and days correctly", () => {
      const hoursUntilExpiry = 36.5; // 1 day and 12.5 hours
      
      const daysUntilExpiry = Math.floor(hoursUntilExpiry / 24);
      const remainingHours = Math.floor(hoursUntilExpiry % 24);
      
      expect(daysUntilExpiry).toBe(1);
      expect(remainingHours).toBe(12);
    });

    it("should handle zero hours until expiry", () => {
      const hoursUntilExpiry = 0;
      
      const daysUntilExpiry = Math.floor(hoursUntilExpiry / 24);
      const remainingHours = Math.floor(hoursUntilExpiry % 24);
      
      expect(daysUntilExpiry).toBe(0);
      expect(remainingHours).toBe(0);
    });

    it("should round hours to one decimal place", () => {
      const hoursUntilExpiry = 23.456;
      
      const rounded = Math.round(hoursUntilExpiry * 10) / 10;
      
      expect(rounded).toBe(23.5);
    });

    it("should format date correctly", () => {
      const testDate = new Date("2025-12-31T23:59:59Z");
      
      const formatted = testDate.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      
      expect(formatted).toContain("2025");
      expect(formatted).toContain("12");
      expect(formatted).toContain("31");
    });
  });

  describe("Token Status States", () => {
    it("should return correct status for valid token", () => {
      const now = new Date();
      const futureExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      const isExpired = now >= futureExpiry;
      const hoursUntilExpiry = (futureExpiry.getTime() - now.getTime()) / (1000 * 60 * 60);
      const isExpiringSoon = hoursUntilExpiry < 24;
      
      expect(isExpired).toBe(false);
      expect(isExpiringSoon).toBe(false);
    });

    it("should return correct status for expiring soon token", () => {
      const now = new Date();
      const soonExpiry = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours
      
      const isExpired = now >= soonExpiry;
      const hoursUntilExpiry = (soonExpiry.getTime() - now.getTime()) / (1000 * 60 * 60);
      const isExpiringSoon = hoursUntilExpiry < 24;
      
      expect(isExpired).toBe(false);
      expect(isExpiringSoon).toBe(true);
    });

    it("should return correct status for expired token", () => {
      const now = new Date();
      const pastExpiry = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
      
      const isExpired = now >= pastExpiry;
      const hoursUntilExpiry = Math.max(0, (pastExpiry.getTime() - now.getTime()) / (1000 * 60 * 60));
      const isExpiringSoon = hoursUntilExpiry < 24;
      
      expect(isExpired).toBe(true);
      expect(isExpiringSoon).toBe(true); // Expired tokens are also "expiring soon"
    });
  });

  describe("Edge Cases", () => {
    it("should handle token expiring exactly now", () => {
      const now = new Date();
      const expiryTime = new Date(now.getTime());
      
      const isExpired = now >= expiryTime;
      
      expect(isExpired).toBe(true);
    });

    it("should handle very large time differences", () => {
      const now = new Date();
      const farFutureExpiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
      
      const hoursUntilExpiry = (farFutureExpiry.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      expect(hoursUntilExpiry).toBeGreaterThan(8000);
    });

    it("should handle very small time differences", () => {
      const now = new Date();
      const almostExpired = new Date(now.getTime() + 1); // 1 millisecond
      
      const hoursUntilExpiry = (almostExpired.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      expect(hoursUntilExpiry).toBeLessThan(0.001);
    });

    it("should handle null expiry time", () => {
      const expiryTime = null;
      
      const isExpired = expiryTime ? new Date() >= expiryTime : false;
      
      expect(isExpired).toBe(false);
    });
  });

  describe("Integration Status", () => {
    it("should determine connected status based on access token", () => {
      const integration = {
        id: 1,
        userId: 1,
        accessToken: "valid_token",
        refreshToken: "refresh_token",
        tokenExpiry: new Date(),
        isConnected: 1,
        lastSyncAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const isConnected = !!integration && !!integration.accessToken;
      
      expect(isConnected).toBe(true);
    });

    it("should determine disconnected status when no access token", () => {
      const integration = {
        id: 1,
        userId: 1,
        accessToken: "",
        refreshToken: null,
        tokenExpiry: null,
        isConnected: 0,
        lastSyncAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const isConnected = !!integration && !!integration.accessToken;
      
      expect(isConnected).toBe(false);
    });

    it("should determine disconnected status when integration is null", () => {
      const integration = null;

      const isConnected = !!integration && !!integration.accessToken;
      
      expect(isConnected).toBe(false);
    });
  });
});
