# Google Fit OAuth 集成指南

## 概述

SomnoAI 应用已集成 Google Fit OAuth 2.0 授权流程，允许用户授权应用访问其睡眠和心率数据。

## 架构

### 1. 前端流程

**文件**: `client/src/components/GoogleFitSync.tsx`

- 用户点击"连接 Google Fit"按钮
- 调用 tRPC 端点 `trpc.googleFit.getAuthUrl.useQuery()`
- 获取 Google OAuth 授权 URL
- 重定向到 Google 登录页面

### 2. 后端 OAuth 回调处理

**文件**: `server/routes/googleFitIntegration.ts`

#### 关键端点

**GET `/api/google-fit/auth-url`**
- 生成 Google OAuth 授权 URL
- 包含用户 ID 在 state 参数中
- 请求的权限范围：
  - `fitness.sleep.read` - 读取睡眠数据
  - `fitness.heart_rate.read` - 读取心率数据
  - `fitness.activity.read` - 读取活动数据
  - `fitness.body.read` - 读取身体数据

**GET `/api/google-fit/callback`**
- 处理 Google OAuth 回调
- 交换授权码获取访问令牌
- 保存令牌到数据库
- 自动同步用户的 Google Fit 数据

**POST `/api/google-fit/sync`**
- 手动触发数据同步
- 从 Google Fit 获取过去 30 天的数据

**GET `/api/google-fit/status`**
- 获取 Google Fit 连接状态
- 返回连接状态和最后同步时间

## 数据库存储

### Google Fit 集成表

**表名**: `google_fit_integrations`

```sql
CREATE TABLE google_fit_integrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  accessToken TEXT NOT NULL,
  refreshToken TEXT,
  tokenExpiry TIMESTAMP,
  isConnected INT DEFAULT 1,
  lastSyncAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INT | 主键 |
| `userId` | INT | 用户 ID |
| `accessToken` | TEXT | Google OAuth 访问令牌 |
| `refreshToken` | TEXT | Google OAuth 刷新令牌（用于令牌过期时刷新） |
| `tokenExpiry` | TIMESTAMP | 访问令牌过期时间 |
| `isConnected` | INT | 连接状态（1 = 已连接，0 = 已断开） |
| `lastSyncAt` | TIMESTAMP | 最后同步时间 |
| `createdAt` | TIMESTAMP | 创建时间 |
| `updatedAt` | TIMESTAMP | 更新时间 |

## OAuth 流程详解

### 1. 获取授权 URL

```
用户点击"连接 Google Fit"
    ↓
前端调用 getAuthUrl 端点
    ↓
后端生成 Google OAuth URL，包含：
  - client_id: Google 应用 ID
  - redirect_uri: /api/google-fit/callback
  - scopes: fitness 权限
  - state: 包含 userId 的 JSON
    ↓
前端重定向到 Google 登录页面
```

### 2. 处理授权回调

```
用户在 Google 页面授权
    ↓
Google 重定向到 /api/google-fit/callback?code=AUTH_CODE&state=STATE
    ↓
后端处理：
  1. 解析 state 参数获取 userId
  2. 使用 code 调用 Google API 获取访问令牌
  3. 保存令牌到数据库（创建或更新）
  4. 自动同步用户的 Google Fit 数据
    ↓
重定向回首页（/?google_fit_connected=true）
```

### 3. 令牌管理

- **访问令牌**: 用于调用 Google Fit API，有效期通常为 1 小时
- **刷新令牌**: 用于在访问令牌过期时获取新的访问令牌
- **令牌过期**: 存储在 `tokenExpiry` 字段中

## 数据同步

### 自动同步

- 用户授权后自动同步过去 30 天的数据
- 每天凌晨 2 点运行定时同步任务（由 `syncScheduler` 处理）

### 同步的数据类型

1. **睡眠数据** (`com.google.android.gms.sleep.segment`)
   - 睡眠开始和结束时间
   - 睡眠总时长

2. **心率数据** (`com.google.heart_rate.bpm`)
   - 平均心率
   - 最低心率
   - 最高心率

### 数据存储

同步的数据存储在两个表中：

- `sleep_records` - 睡眠数据
- `heart_rate_data` - 心率数据

## 环境变量配置

需要以下环境变量：

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 安全考虑

1. **令牌加密**: 访问令牌存储在数据库中，建议在生产环境中加密存储
2. **HTTPS**: 所有 OAuth 通信必须使用 HTTPS
3. **State 参数**: 防止 CSRF 攻击，包含用户 ID
4. **权限最小化**: 仅请求必要的权限范围

## 错误处理

### 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|--------|
| `missing_code` | 授权码缺失 | 用户拒绝授权或网络问题 |
| `not_authenticated` | 用户未认证 | 确保用户已登录 |
| `Failed to get token` | 授权码无效或过期 | 重新开始授权流程 |

### 调试

启用日志查看详细信息：

```bash
# 查看后端日志
tail -f /var/log/somnoai/server.log

# 查看浏览器控制台
F12 -> Console 标签
```

## 测试

运行 Google Fit 集成测试：

```bash
npm run test -- googleFit.test.ts
```

测试覆盖：
- 令牌存储和更新
- 连接状态检查
- OAuth 状态参数处理
- 令牌交换验证

## 前端集成示例

```tsx
import { GoogleFitSync } from '@/components/GoogleFitSync';

export function Dashboard() {
  return (
    <div>
      <GoogleFitSync />
    </div>
  );
}
```

## 后续改进

1. **令牌刷新**: 实现自动刷新过期的访问令牌
2. **数据增量同步**: 仅同步新增数据而不是重新同步所有数据
3. **用户界面**: 显示同步进度和错误信息
4. **数据验证**: 验证同步的数据完整性和准确性
5. **隐私设置**: 允许用户选择要同步的数据类型

## 相关文件

- `server/routes/googleFitIntegration.ts` - OAuth 回调处理
- `server/db.ts` - 数据库查询函数
- `client/src/components/GoogleFitSync.tsx` - 前端组件
- `server/services/syncScheduler.ts` - 定时同步任务
- `drizzle/schema.ts` - 数据库 schema
