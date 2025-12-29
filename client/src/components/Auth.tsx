import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectGoogleFit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // 使用后端 OAuth 流程
      const response = await fetch('/api/google-fit/auth-url');
      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (err) {
      console.error('Failed to connect Google Fit:', err);
      setError('Failed to connect to Google Fit. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">SomnoAI</h1>
          <p className="text-gray-300 text-lg">Digital Sleep Lab</p>
          <p className="text-gray-400 text-sm mt-2">智能睡眠管理应用</p>
        </div>

        {/* 登录卡片 */}
        <div className="bg-black/30 backdrop-blur-md rounded-lg p-8 border border-cyan-500/20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            连接 Google Fit
          </h2>

          <p className="text-gray-300 text-center mb-6">
            使用您的 Google 账户登录，授权访问您的睡眠和心率数据
          </p>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* 登录按钮 */}
          <Button
            onClick={handleConnectGoogleFit}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 mb-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                连接中...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                连接 Google Fit
              </>
            )}
          </Button>

          {/* 功能说明 */}
          <div className="mt-8 pt-6 border-t border-cyan-500/20">
            <h3 className="text-white font-semibold mb-4">应用功能：</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold">✓</span>
                <span>追踪您的睡眠质量和时长</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold">✓</span>
                <span>监测心率和健康指标</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold">✓</span>
                <span>获取 AI 个性化睡眠建议</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold">✓</span>
                <span>设置睡眠目标并追踪进度</span>
              </li>
            </ul>
          </div>

          {/* 隐私声明 */}
          <div className="mt-6 pt-6 border-t border-cyan-500/20">
            <p className="text-gray-400 text-xs text-center">
              我们尊重您的隐私。您的数据仅用于改善睡眠健康。
              <br />
              查看{' '}
              <a href="/privacypolicy" className="text-cyan-400 hover:text-cyan-300">
                隐私政策
              </a>
            </p>
          </div>
        </div>

        {/* 底部说明 */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>首次登录时，Google 会要求您授权访问睡眠和心率数据</p>
        </div>
      </div>
    </div>
  );
}
