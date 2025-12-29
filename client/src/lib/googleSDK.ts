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
  maxRetries: 3,
  timeout: 10000, // 10 秒超时
};

/**
 * 加载 Google SDK
 */
export async function loadGoogleSDK(options: GoogleSDKLoadOptions = {}): Promise<boolean> {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };

  // 如果已经加载成功，直接返回
  if (googleSDKStatus.loaded) {
    console.log("✓ Google SDK 已加载");
    options.onSuccess?.();
    return true;
  }

  // 如果正在加载，等待
  if (googleSDKStatus.loading) {
    console.log("⟳ Google SDK 正在加载...");
    // 等待加载完成
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (googleSDKStatus.loaded) {
          clearInterval(checkInterval);
          options.onSuccess?.();
          resolve(true);
        } else if (googleSDKStatus.error && googleSDKStatus.retryCount >= (finalOptions.maxRetries || 3)) {
          clearInterval(checkInterval);
          options.onError?.(googleSDKStatus.error);
          resolve(false);
        }
      }, 100);
    });
  }

  // 检查是否已经加载过（全局 window.google）
  if (window.google?.accounts?.id) {
    console.log("✓ Google SDK 已在全局加载");
    googleSDKStatus.loaded = true;
    options.onSuccess?.();
    return true;
  }

  // 开始加载
  googleSDKStatus.loading = true;
  googleSDKStatus.retryCount = 0;

  return new Promise((resolve) => {
    const attemptLoad = () => {
      // 检查是否超过最大重试次数
      if (googleSDKStatus.retryCount >= (finalOptions.maxRetries || 3)) {
        const error = new Error(
          `Google SDK 加载失败，已重试 ${googleSDKStatus.retryCount} 次。` +
          `可能的原因：1) 网络连接问题 2) Google 服务不可用 3) 浏览器扩展阻止 4) 隐私设置限制`
        );
        googleSDKStatus.error = error;
        googleSDKStatus.loading = false;
        console.error("✗ Google SDK 加载失败:", error.message);
        options.onError?.(error);
        resolve(false);
        return;
      }

      // 检查脚本是否已存在
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (existingScript) {
        console.log("✓ Google SDK 脚本已存在");
        // 等待脚本加载完成
        const checkGoogleInterval = setInterval(() => {
          if (window.google?.accounts?.id) {
            clearInterval(checkGoogleInterval);
            googleSDKStatus.loaded = true;
            googleSDKStatus.loading = false;
            googleSDKStatus.error = null;
            console.log("✓ Google SDK 已加载");
            options.onSuccess?.();
            resolve(true);
          }
        }, 100);

        // 设置超时
        setTimeout(() => {
          clearInterval(checkGoogleInterval);
          if (!googleSDKStatus.loaded) {
            googleSDKStatus.retryCount++;
            console.warn(`⚠ Google SDK 加载超时，重试 ${googleSDKStatus.retryCount}/${finalOptions.maxRetries}...`);
            attemptLoad();
          }
        }, finalOptions.timeout);
        return;
      }

      // 创建并加载脚本
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;

      // 设置加载超时
      const timeoutId = setTimeout(() => {
        console.warn(`⚠ Google SDK 加载超时 (${finalOptions.timeout}ms)，重试 ${googleSDKStatus.retryCount + 1}/${finalOptions.maxRetries}...`);
        googleSDKStatus.retryCount++;
        attemptLoad();
      }, finalOptions.timeout);

      script.onload = () => {
        clearTimeout(timeoutId);
        // 再等待一下确保 window.google 已准备好
        setTimeout(() => {
          if (window.google?.accounts?.id) {
            googleSDKStatus.loaded = true;
            googleSDKStatus.loading = false;
            googleSDKStatus.error = null;
            console.log("✓ Google SDK 已加载");
            options.onSuccess?.();
            resolve(true);
          } else {
            console.warn("⚠ Google SDK 脚本加载但 window.google 未定义，重试...");
            googleSDKStatus.retryCount++;
            attemptLoad();
          }
        }, 100);
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        console.warn(`⚠ Google SDK 脚本加载失败，重试 ${googleSDKStatus.retryCount + 1}/${finalOptions.maxRetries}...`);
        googleSDKStatus.retryCount++;
        attemptLoad();
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
  console.log("✓ Google SDK 状态已重置");
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
export function waitForGoogleSDK(timeout: number = 10000): Promise<boolean> {
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
        console.error("✗ 等待 Google SDK 加载超时");
        resolve(false);
      }
    }, 100);
  });
}
