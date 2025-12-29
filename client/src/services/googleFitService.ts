/**
 * Google Fit Service
 * 负责初始化 Google Identity Services (GSI) SDK、处理 OAuth2 授权和 Google Fit API 调用
 */

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

class GoogleFitService {
  private tokenClient: any = null;
  private accessToken: string | null = null;
  private clientId: string;

  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    if (!this.clientId) {
      console.error('VITE_GOOGLE_CLIENT_ID is not set');
    }
  }

  /**
   * 初始化 Google Identity Services SDK
   */
  public async initGSI(): Promise<void> {
    return new Promise((resolve, reject) => {
      // 检查 Google 脚本是否已加载
      if (!(window as any).google) {
        console.error('Google Identity Services library not loaded');
        reject(new Error('Google Identity Services library not loaded'));
        return;
      }

      try {
        // 初始化 Token Client
        this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: [
            'https://www.googleapis.com/auth/fitness.sleep.read',
            'https://www.googleapis.com/auth/fitness.heart_rate.read',
            'https://www.googleapis.com/auth/fitness.body.read',
            'https://www.googleapis.com/auth/fitness.activity.read',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
          ].join(' '),
          callback: this.handleTokenResponse.bind(this),
        });

        console.log('Google Identity Services initialized successfully');
        resolve();
      } catch (error) {
        console.error('Failed to initialize Google Identity Services:', error);
        reject(error);
      }
    });
  }

  /**
   * 处理令牌响应
   */
  private handleTokenResponse(response: TokenResponse): void {
    if (response.access_token) {
      this.accessToken = response.access_token;
      console.log('Access token obtained successfully');

      // 发送令牌到后端进行验证和保存
      this.sendTokenToBackend(response.access_token);
    } else {
      console.error('Failed to obtain access token');
    }
  }

  /**
   * 发送令牌到后端
   */
  private async sendTokenToBackend(accessToken: string): Promise<void> {
    try {
      const response = await fetch('/api/google-fit/save-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      });

      if (response.ok) {
        console.log('Token saved to backend successfully');
        // 刷新页面或更新 UI
        window.location.href = '/?google_fit_connected=true';
      } else {
        console.error('Failed to save token to backend');
      }
    } catch (error) {
      console.error('Error sending token to backend:', error);
    }
  }

  /**
   * 请求授权（调起 Google 登录弹窗）
   */
  public authorize(): void {
    if (!this.tokenClient) {
      console.error('Token client not initialized');
      return;
    }

    // 检查是否已有访问令牌
    if (this.accessToken) {
      console.log('Already have access token');
      return;
    }

    // 调起 Google 登录弹窗
    this.tokenClient.requestAccessToken({ prompt: 'consent' });
  }

  /**
   * 获取访问令牌
   */
  public getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * 设置访问令牌
   */
  public setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * 撤销授权
   */
  public revokeAccess(): void {
    if (this.accessToken) {
      (window as any).google.accounts.oauth2.revoke(this.accessToken, () => {
        this.accessToken = null;
        console.log('Access revoked');
      });
    }
  }

  /**
   * 调用 Google Fit API 获取睡眠数据
   */
  public async getSleepData(startDate: Date, endDate: Date): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const startTimeMillis = startDate.getTime();
    const endTimeMillis = endDate.getTime();

    try {
      const response = await fetch(
        'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            aggregateBy: [
              {
                dataTypeName: 'com.google.android.gms.sleep.segment',
              },
            ],
            bucketByTime: { durationMillis: 86400000 }, // 1 day
            startTimeMillis,
            endTimeMillis,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get sleep data:', error);
      throw error;
    }
  }

  /**
   * 调用 Google Fit API 获取心率数据
   */
  public async getHeartRateData(startDate: Date, endDate: Date): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const startTimeMillis = startDate.getTime();
    const endTimeMillis = endDate.getTime();

    try {
      const response = await fetch(
        'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            aggregateBy: [
              {
                dataTypeName: 'com.google.heart_rate.bpm',
              },
            ],
            bucketByTime: { durationMillis: 86400000 }, // 1 day
            startTimeMillis,
            endTimeMillis,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get heart rate data:', error);
      throw error;
    }
  }
}

// 导出单例
export const googleFitService = new GoogleFitService();
