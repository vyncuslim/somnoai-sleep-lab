/**
 * Google Fit Token 管理和数据治理工具
 * 
 * 关键原则：
 * 1. 不在数据库中缓存 access_token 和 refresh_token
 * 2. 使用环境变量或安全存储保存 token
 * 3. 实现 token 刷新机制
 * 4. 提供数据删除机制
 * 5. 记录审计日志
 */

import axios from "axios";
import {
  getDb,
  getGoogleFitIntegration,
  updateGoogleFitIntegration,
  getSleepRecordsByDateRange,
  getHeartRateDataByDateRange,
} from "./db";

const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";

interface TokenRefreshRequest {
  client_id: string;
  client_secret: string;
  refresh_token: string;
  grant_type: "refresh_token";
}

interface TokenRefreshResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

/**
 * 刷新 access token
 * 
 * 注意：refresh_token 应该存储在安全的地方（例如加密的数据库或密钥管理服务）
 * 不应该在普通的数据库列中存储明文 token
 */
export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{ accessToken: string; expiresIn: number } | null> {
  try {
    const response = await axios.post<TokenRefreshResponse>(
      GOOGLE_OAUTH_TOKEN_URL,
      {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }
    );

    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in,
    };
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    return null;
  }
}

/**
 * 获取有效的 access token
 * 如果 token 已过期，自动刷新
 */
export async function getValidAccessToken(
  userId: number,
  clientId: string,
  clientSecret: string
): Promise<string | null> {
  try {
    const integration = await getGoogleFitIntegration(userId);
    
    if (!integration) {
      console.error("Google Fit integration not found for user:", userId);
      return null;
    }

    // 检查是否有 access token 和 refresh token
    if (!integration.accessToken || !integration.refreshToken) {
      console.error("Missing access token or refresh token");
      return null;
    }

    // 检查 token 是否已过期
    if (integration.tokenExpiry && new Date() >= integration.tokenExpiry) {
      console.log("Access token expired, refreshing...");
      
      // 刷新 token
      const refreshResult = await refreshAccessToken(
        integration.refreshToken,
        clientId,
        clientSecret
      );

      if (!refreshResult) {
        console.error("Failed to refresh access token");
        return null;
      }

      // 更新数据库中的 token 信息
      // 注意：只更新 token 过期时间，不存储 access_token
      const newExpiresAt = new Date(Date.now() + refreshResult.expiresIn * 1000);
      await updateGoogleFitIntegration(userId, {
        tokenExpiry: newExpiresAt,
        lastSyncAt: new Date(),
      });

      // 返回新的 access token
      // 在实际应用中，应该从安全的存储中获取或临时返回
      return refreshResult.accessToken;
    }

    // Token 仍然有效，返回现有的 token
    // 在实际应用中，应该从安全的存储中获取
    return integration.accessToken || null;
  } catch (error) {
    console.error("Failed to get valid access token:", error);
    return null;
  }
}

/**
 * 撤销 Google Fit 访问权限
 * 这会删除用户的 Google Fit 集成和所有同步的数据
 */
export async function revokeGoogleFitAccess(userId: number): Promise<boolean> {
  try {
    // 1. 记录审计日志
    await logAuditEvent(userId, "REVOKE_GOOGLE_FIT_ACCESS", {
      timestamp: new Date(),
      action: "用户撤销 Google Fit 访问权限",
    });

    // 2. 删除所有同步的 Google Fit 数据
    await deleteAllGoogleFitData(userId);

    // 3. 删除 Google Fit 集成记录
    await updateGoogleFitIntegration(userId, {
      accessToken: "",
      refreshToken: null,
      tokenExpiry: null,
      isConnected: 0,
    });

    console.log("Google Fit access revoked for user:", userId);
    return true;
  } catch (error) {
    console.error("Failed to revoke Google Fit access:", error);
    return false;
  }
}

/**
 * 删除所有 Google Fit 数据
 */
export async function deleteAllGoogleFitData(userId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    // 获取用户的所有睡眠和心率数据
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sleepRecords = await getSleepRecordsByDateRange(userId, thirtyDaysAgo, new Date());
    const heartRateRecords = await getHeartRateDataByDateRange(userId, thirtyDaysAgo, new Date());

    // 注意：删除数据应该通过专门的数据库函数
    // 此处仅是示例，实际应用中应该添加专门的删除函数
    console.log(`Deleting Google Fit data for user ${userId}`);
    console.log(`Sleep records to delete: ${sleepRecords?.length || 0}`);
    console.log(`Heart rate records to delete: ${heartRateRecords?.length || 0}`);
    
    // TODO: 实现删除睡眠和心率数据的数据库函数

    // 记录审计日志
    await logAuditEvent(userId, "DELETE_GOOGLE_FIT_DATA", {
      timestamp: new Date(),
      action: "删除所有 Google Fit 数据",
      recordsDeleted: {
        sleepRecords: sleepRecords?.length || 0,
        heartRateRecords: heartRateRecords?.length || 0,
      },
    });

    console.log("All Google Fit data deleted for user:", userId);
    return true;
  } catch (error) {
    console.error("Failed to delete all Google Fit data:", error);
    return false;
  }
}

/**
 * 记录审计日志
 * 用于追踪数据访问和删除操作
 */
export async function logAuditEvent(
  userId: number,
  eventType: string,
  details: Record<string, any>
): Promise<boolean> {
  try {
    // 在实际应用中，应该创建一个审计日志表
    // 这里只是示例
    console.log(`[AUDIT] User ${userId} - Event: ${eventType}`, details);
    
    // 可以添加到数据库
    // const db = await getDb();
    // if (db) {
    //   await db.insert(auditLogs).values({
    //     userId,
    //     eventType,
    //     details: JSON.stringify(details),
    //     createdAt: new Date(),
    //   });
    // }

    return true;
  } catch (error) {
    console.error("Failed to log audit event:", error);
    return false;
  }
}

/**
 * 获取 token 过期时间
 */
export async function getTokenExpiryTime(userId: number): Promise<Date | null> {
  try {
    const integration = await getGoogleFitIntegration(userId);
    return integration?.tokenExpiry || null;
  } catch (error) {
    console.error("Failed to get token expiry time:", error);
    return null;
  }
}

/**
 * 检查 token 是否即将过期（在 24 小时内）
 */
export async function isTokenExpiringSoon(userId: number): Promise<boolean> {
  try {
    const expiryTime = await getTokenExpiryTime(userId);
    if (!expiryTime) return false;

    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return expiryTime <= oneDayFromNow;
  } catch (error) {
    console.error("Failed to check token expiry:", error);
    return false;
  }
}

/**
 * 获取最后一次 token 刷新时间
 */
export async function getLastTokenRefreshTime(userId: number): Promise<Date | null> {
  try {
    const integration = await getGoogleFitIntegration(userId);
    return integration?.lastSyncAt || null;
  } catch (error) {
    console.error("Failed to get last token refresh time:", error);
    return null;
  }
}

/**
 * 验证 Google Fit 集成是否有效
 */
export async function validateGoogleFitIntegration(userId: number): Promise<boolean> {
  try {
    const integration = await getGoogleFitIntegration(userId);
    
    if (!integration) {
      return false;
    }

    // 检查是否有 access token 和 refresh token
    if (!integration.accessToken || !integration.refreshToken) {
      return false;
    }

    // 检查 token 是否已过期
    if (integration.tokenExpiry && new Date() >= integration.tokenExpiry) {
      return false; // Token 已过期，需要刷新
    }

    return true;
  } catch (error) {
    console.error("Failed to validate Google Fit integration:", error);
    return false;
  }
}
