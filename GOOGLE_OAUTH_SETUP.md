# Google Fit OAuth 2.0 配置指南

## 当前状态
- ✅ 应用代码已准备好
- ⏳ Google 应用验证进行中
- 🔄 等待 Google 验证完成

## Google Cloud Console 配置检查清单

### 1. OAuth 同意屏幕配置
- [ ] 打开 [Google Cloud Console](https://console.cloud.google.com/)
- [ ] 选择您的项目
- [ ] 进入 **APIs & Services** → **OAuth consent screen**
- [ ] 选择 **User Type: External**（用于生产环境）或 **Internal**（用于测试）
- [ ] 填写应用信息：
  - App name: `SomnoAI Digital Sleep Lab`
  - User support email: 您的邮箱
  - Developer contact: 您的邮箱
- [ ] 添加应用 logo（可选）
- [ ] 添加隐私政策 URL: `https://somnoai-lab-bvvlgs8k.manus.space/privacy`
- [ ] 添加服务条款 URL: `https://somnoai-lab-bvvlgs8k.manus.space/terms`
- [ ] 点击 **Save and Continue**

### 2. API Scopes 配置
- [ ] 在 **Scopes** 页面，点击 **Add or Remove Scopes**
- [ ] 添加以下 scopes：
  - `https://www.googleapis.com/auth/fitness.sleep.read` - 读取睡眠数据
  - `https://www.googleapis.com/auth/fitness.heart_rate.read` - 读取心率数据
  - `https://www.googleapis.com/auth/fitness.activity.read` - 读取活动数据
  - `https://www.googleapis.com/auth/fitness.body.read` - 读取身体数据
- [ ] 点击 **Save and Continue**

### 3. 测试用户配置（Testing 模式）
- [ ] 在 **Test users** 页面，点击 **Add users**
- [ ] 添加您的 Google 账户邮箱
- [ ] 点击 **Save and Continue**

### 4. OAuth 凭据配置
- [ ] 进入 **APIs & Services** → **Credentials**
- [ ] 找到 OAuth 2.0 Client ID（类型：Web application）
- [ ] 点击编辑，验证以下内容：
  - **Authorized JavaScript origins**:
    - `https://somnoai-lab-bvvlgs8k.manus.space`
    - `http://localhost:3000`（用于本地开发）
  - **Authorized redirect URIs**:
    - `https://somnoai-lab-bvvlgs8k.manus.space/api/google-fit/callback`
    - `http://localhost:3000/api/google-fit/callback`（用于本地开发）
- [ ] 保存更改

### 5. Google Fit API 启用
- [ ] 进入 **APIs & Services** → **Library**
- [ ] 搜索 "Google Fit"
- [ ] 点击 **Google Fit API**
- [ ] 点击 **Enable**

### 6. 应用验证（生产环境）
- [ ] 等待 Google 完成应用验证
- [ ] 验证完成后，将应用从 **Testing** 模式更改为 **Production** 模式
- [ ] 更新 OAuth 同意屏幕，添加所有必需的应用信息

## 应用端配置

### 环境变量
```
GOOGLE_CLIENT_ID=312904526470-84ra3lld33sci0kvhset8523b0hdul1c.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### 重定向 URI
- 生产环境: `https://somnoai-lab-bvvlgs8k.manus.space/api/google-fit/callback`
- 本地开发: `http://localhost:3000/api/google-fit/callback`

## 测试步骤

1. **访问应用首页**
   - 打开 `https://somnoai-sleep-lab-bvvlgs8k.manus.space`
   - 点击 "开始使用" 按钮

2. **连接 Google Fit**
   - 在 Dashboard 中找到 "Google Fit 连接" 卡片
   - 点击 "连接 Google Fit" 按钮
   - 应该跳转到 Google 授权页面

3. **授权**
   - 使用您的 Google 账户登录
   - 授予应用访问睡眠、心率等数据的权限
   - 应该重定向回应用，显示连接成功

4. **验证数据同步**
   - 检查 Dashboard 是否显示来自 Google Fit 的数据
   - 检查最后同步时间是否更新

## 常见问题排查

### 错误：`redirect_uri_mismatch`
- 确保 Google Cloud Console 中的重定向 URI 与应用中的完全一致
- 检查是否包含尾部斜杠或其他差异

### 错误：`invalid_client`
- 验证 Client ID 和 Secret 是否正确
- 确保凭据类型是 "Web application"

### 错误：`access_denied`
- 用户拒绝了权限授予
- 再次尝试授权

### 错误：`invalid_scope`
- 确保所有 scopes 都已在 OAuth 同意屏幕中添加
- 检查 scope 字符串的拼写

## 应用架构

### 前端流程
1. 用户点击 "连接 Google Fit" 按钮
2. 前端调用 tRPC 路由 `googleFit.getAuthUrl` 获取授权 URL
3. 重定向到 Google 授权页面
4. 用户授权后，Google 重定向回应用的回调 URL

### 后端流程
1. `/api/google-fit/auth-url` - 生成 Google OAuth 授权 URL
2. `/api/google-fit/callback` - 处理 Google 回调，交换授权码获取令牌
3. `/api/google-fit/sync` - 手动同步 Google Fit 数据
4. `/api/google-fit/status` - 获取连接状态

## 数据库表

### googleFitTokens 表
存储 Google Fit 集成信息：
- `userId` - 用户 ID
- `accessToken` - Google OAuth 访问令牌
- `refreshToken` - 刷新令牌
- `tokenExpiry` - 令牌过期时间
- `lastSyncAt` - 最后同步时间
- `isConnected` - 连接状态

## 后续步骤

1. ✅ 完成 Google Cloud Console 配置
2. ⏳ 等待 Google 应用验证完成
3. 🔄 测试 OAuth 流程
4. 📊 验证数据同步
5. 🚀 部署到生产环境
