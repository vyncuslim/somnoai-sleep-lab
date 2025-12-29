/**
 * Google SDK 加载工具函数
 * 提供健壮的 Google SDK 加载机制，包括重试、超时和错误处理
 */

interface GoogleSDKLoadOptions {
  maxRetries?: number;
  timeout?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface GoogleSDKStatus {
  loaded: boolean;
  loading: boolean;
  error: Error | null;
  retryCount: number;
}

let googleSDKStatus: GoogleSDKStatus = {
  loaded: false,
  loading: false,
  error: null,
  retryCount: 0,
};

const DEFAULT_OPTIONS: GoogleSDKLoadOptions = {
  maxRetries: 5,
  timeout: 15000,
};

/**
 * 加载 Google SDK
 */
export async function loadGoogleSDK(options: GoogleSDKLoadOptions = {}): Promise<boolean> {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };

  if (googleSDKStatus.loaded) {
    console.log("[Google SDK] Already loaded");
    options.onSuccess?.();
    return true;
  }

  if (googleSDKStatus.loading) {
    console.log("[Google SDK] Loading in progress...");
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (googleSDKStatus.loaded) {
          clearInterval(checkInterval);
          options.onSuccess?.();
          resolve(true);
        } else if (googleSDKStatus.error && googleSDKStatus.retryCount >= (finalOptions.maxRetries || 5)) {
          clearInterval(checkInterval);
          options.onError?.(googleSDKStatus.error);
          resolve(false);
        }
      }, 100);
    });
  }

  if (window.google?.accounts?.id) {
    console.log("[Google SDK] Already loaded globally");
    googleSDKStatus.loaded = true;
    options.onSuccess?.();
    return true;
  }

  googleSDKStatus.loading = true;
  googleSDKStatus.retryCount = 0;

  return new Promise((resolve) => {
    const attemptLoad = () => {
      if (googleSDKStatus.retryCount >= (finalOptions.maxRetries || 5)) {
        const error = new Error(
          `Google SDK failed to load after ${googleSDKStatus.retryCount} retries. ` +
          `Possible reasons: 1) Network issue 2) Google service unavailable 3) Browser extension blocking 4) Privacy settings`
        );
        googleSDKStatus.error = error;
        googleSDKStatus.loading = false;
        console.error("[Google SDK] Load failed:", error.message);
        options.onError?.(error);
        resolve(false);
        return;
      }

      const existingScript = document.querySelector(
        'script[src*="accounts.google.com/gsi/client"]'
      );
      if (existingScript) {
        console.log("[Google SDK] Script already exists, waiting for initialization...");
        const checkGoogleInterval = setInterval(() => {
          if (window.google?.accounts?.id) {
            clearInterval(checkGoogleInterval);
            googleSDKStatus.loaded = true;
            googleSDKStatus.loading = false;
            googleSDKStatus.error = null;
            console.log("[Google SDK] Loaded successfully");
            options.onSuccess?.();
            resolve(true);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkGoogleInterval);
          if (!googleSDKStatus.loaded) {
            googleSDKStatus.retryCount++;
            console.warn(`[Google SDK] Load timeout, retrying ${googleSDKStatus.retryCount}/${finalOptions.maxRetries}...`);
            attemptLoad();
          }
        }, finalOptions.timeout);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";

      const timeoutId = setTimeout(() => {
        console.warn(`[Google SDK] Load timeout (${finalOptions.timeout}ms), retrying ${googleSDKStatus.retryCount + 1}/${finalOptions.maxRetries}...`);
        googleSDKStatus.retryCount++;
        script.remove();
        setTimeout(() => {
          attemptLoad();
        }, 1000 * googleSDKStatus.retryCount);
      }, finalOptions.timeout);

      script.onload = () => {
        clearTimeout(timeoutId);
        setTimeout(() => {
          if (window.google?.accounts?.id) {
            googleSDKStatus.loaded = true;
            googleSDKStatus.loading = false;
            googleSDKStatus.error = null;
            console.log("[Google SDK] Loaded successfully");
            options.onSuccess?.();
            resolve(true);
          } else {
            console.warn("[Google SDK] Script loaded but window.google not defined, retrying...");
            googleSDKStatus.retryCount++;
            script.remove();
            setTimeout(() => {
              attemptLoad();
            }, 1000 * googleSDKStatus.retryCount);
          }
        }, 100);
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        console.warn(`[Google SDK] Script load failed, retrying ${googleSDKStatus.retryCount + 1}/${finalOptions.maxRetries}...`);
        googleSDKStatus.retryCount++;
        script.remove();
        setTimeout(() => {
          attemptLoad();
        }, 1000 * googleSDKStatus.retryCount);
      };

      document.head.appendChild(script);
    };

    attemptLoad();
  });
}

/**
 * 获取 Google SDK 加载状态
 */
export function getGoogleSDKStatus(): GoogleSDKStatus {
  return { ...googleSDKStatus };
}

/**
 * 重置 Google SDK 加载状态
 */
export function resetGoogleSDKStatus(): void {
  googleSDKStatus = {
    loaded: false,
    loading: false,
    error: null,
    retryCount: 0,
  };
  console.log("[Google SDK] Status reset");
}

/**
 * 检查 Google SDK 是否可用
 */
export function isGoogleSDKAvailable(): boolean {
  return googleSDKStatus.loaded && !!window.google?.accounts?.id;
}

/**
 * 等待 Google SDK 加载完成
 */
export function waitForGoogleSDK(timeout: number = 15000): Promise<boolean> {
  return new Promise((resolve) => {
    if (isGoogleSDKAvailable()) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isGoogleSDKAvailable()) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        console.error("[Google SDK] Wait timeout");
        resolve(false);
      }
    }, 100);
  });
}
