import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  loadGoogleSDK,
  getGoogleSDKStatus,
  resetGoogleSDKStatus,
  isGoogleSDKAvailable,
  waitForGoogleSDK,
} from "./googleSDK";

describe("Google SDK Loading Utility", () => {
  beforeEach(() => {
    // 重置状态
    resetGoogleSDKStatus();
    // 清理全局 google 对象
    if (window.google) {
      delete (window as any).google;
    }
  });

  afterEach(() => {
    // 清理脚本
    const scripts = document.querySelectorAll('script[src="https://accounts.google.com/gsi/client"]');
    scripts.forEach(script => script.remove());
    resetGoogleSDKStatus();
  });

  describe("getGoogleSDKStatus", () => {
    it("should return initial status", () => {
      const status = getGoogleSDKStatus();
      expect(status.loaded).toBe(false);
      expect(status.loading).toBe(false);
      expect(status.error).toBeNull();
      expect(status.retryCount).toBe(0);
    });
  });

  describe("resetGoogleSDKStatus", () => {
    it("should reset status to initial state", () => {
      // 先改变状态
      let status = getGoogleSDKStatus();
      expect(status.loaded).toBe(false);

      // 重置
      resetGoogleSDKStatus();
      status = getGoogleSDKStatus();
      expect(status.loaded).toBe(false);
      expect(status.loading).toBe(false);
      expect(status.error).toBeNull();
      expect(status.retryCount).toBe(0);
    });
  });

  describe("isGoogleSDKAvailable", () => {
    it("should return false when SDK is not loaded", () => {
      expect(isGoogleSDKAvailable()).toBe(false);
    });

    it("should return true when window.google.accounts.id exists", () => {
      // 模拟 Google SDK 加载
      (window as any).google = {
        accounts: {
          id: {
            initialize: vi.fn(),
            renderButton: vi.fn(),
          },
        },
      };

      expect(isGoogleSDKAvailable()).toBe(true);
    });
  });

  describe("loadGoogleSDK", () => {
    it("should handle already loaded SDK", async () => {
      // 模拟已加载的 SDK
      (window as any).google = {
        accounts: {
          id: {
            initialize: vi.fn(),
            renderButton: vi.fn(),
          },
        },
      };

      const onSuccess = vi.fn();
      const result = await loadGoogleSDK({ onSuccess });

      expect(result).toBe(true);
      expect(onSuccess).toHaveBeenCalled();
    });

    it("should call onError callback on failure", async () => {
      const onError = vi.fn();
      
      // 设置较短的超时和重试次数以加快测试
      const result = await loadGoogleSDK({
        maxRetries: 1,
        timeout: 100,
        onError,
      });

      expect(result).toBe(false);
      expect(onError).toHaveBeenCalled();
      const error = onError.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("加载失败");
    });

    it("should respect maxRetries option", async () => {
      const onError = vi.fn();
      
      const result = await loadGoogleSDK({
        maxRetries: 2,
        timeout: 50,
        onError,
      });

      expect(result).toBe(false);
      const status = getGoogleSDKStatus();
      expect(status.retryCount).toBeLessThanOrEqual(2);
    });

    it("should not load script if already loading", async () => {
      // 第一次加载
      const promise1 = loadGoogleSDK({
        maxRetries: 1,
        timeout: 100,
      });

      // 第二次加载（应该等待第一次完成）
      const promise2 = loadGoogleSDK({
        maxRetries: 1,
        timeout: 100,
      });

      const [result1, result2] = await Promise.all([promise1, promise2]);
      
      // 两个请求都应该返回相同的结果
      expect(result1).toBe(result2);
    });
  });

  describe("waitForGoogleSDK", () => {
    it("should return true if SDK is already available", async () => {
      // 模拟已加载的 SDK
      (window as any).google = {
        accounts: {
          id: {
            initialize: vi.fn(),
            renderButton: vi.fn(),
          },
        },
      };

      // 需要先加载一次以设置状态
      await loadGoogleSDK();

      const result = await waitForGoogleSDK(1000);
      expect(result).toBe(true);
    });

    it("should timeout if SDK is not loaded within timeout period", async () => {
      const result = await waitForGoogleSDK(100);
      expect(result).toBe(false);
    });
  });

  describe("Error Handling", () => {
    it("should provide detailed error message", async () => {
      const onError = vi.fn();
      
      await loadGoogleSDK({
        maxRetries: 1,
        timeout: 50,
        onError,
      });

      expect(onError).toHaveBeenCalled();
      const error = onError.mock.calls[0][0];
      expect(error.message).toContain("可能的原因");
      expect(error.message).toContain("网络连接问题");
    });

    it("should handle script loading errors gracefully", async () => {
      const onError = vi.fn();
      
      const result = await loadGoogleSDK({
        maxRetries: 1,
        timeout: 100,
        onError,
      });

      expect(result).toBe(false);
      expect(onError).toHaveBeenCalled();
    });
  });

  describe("Status Tracking", () => {
    it("should track loading state correctly", async () => {
      const promise = loadGoogleSDK({
        maxRetries: 1,
        timeout: 100,
      });

      // 立即检查状态
      let status = getGoogleSDKStatus();
      expect(status.loading).toBe(true);

      await promise;

      // 加载完成后检查状态
      status = getGoogleSDKStatus();
      expect(status.loading).toBe(false);
    });

    it("should increment retry count on failure", async () => {
      await loadGoogleSDK({
        maxRetries: 2,
        timeout: 50,
      });

      const status = getGoogleSDKStatus();
      expect(status.retryCount).toBeGreaterThan(0);
      expect(status.retryCount).toBeLessThanOrEqual(2);
    });
  });
});
