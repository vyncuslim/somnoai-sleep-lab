import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // 构建 Google OAuth 授权 URL
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/api/oauth/google/callback`;
      const scope = [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/fitness.sleep.read",
        "https://www.googleapis.com/auth/fitness.heart_rate.read",
      ].join(" ");

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: scope,
        access_type: "offline",
        prompt: "consent",
      });

      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    } catch (error) {
      toast.error("Google 登录失败");
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !password) {
        toast.error("请填写邮箱和密码");
        setIsLoading(false);
        return;
      }

      if (!isLogin && password !== confirmPassword) {
        toast.error("两次输入的密码不一致");
        setIsLoading(false);
        return;
      }

      // 这里可以添加邮箱登录/注册的 API 调用
      toast.success(isLogin ? "登录成功" : "注册成功");
    } catch (error) {
      toast.error(isLogin ? "登录失败" : "注册失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8 animate-fade-in-down">
          <h1 className="text-5xl font-bold text-white mb-2">
            <span className="gradient-text">SomnoAI</span>
          </h1>
          <p className="text-xl text-gray-300">数字化睡眠实验室</p>
          <p className="text-gray-400 text-sm mt-2">
            通过 AI 深度洞察和健康建议，帮助您科学管理睡眠质量
          </p>
        </div>

        {/* Login Card */}
        <Card className="glassmorphism p-8 animate-fade-in-up">
          {/* Tab Buttons */}
          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                isLogin
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                !isLogin
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              注册
            </button>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full mb-6 py-3 px-4 bg-white text-slate-900 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            使用 Google 账号{isLogin ? "登录" : "注册"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-400 text-sm">或使用邮箱</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="text-gray-300 text-sm font-semibold mb-2 block">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="text-gray-300 text-sm font-semibold mb-2 block">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password (Register Only) */}
            {!isLogin && (
              <div>
                <label className="text-gray-300 text-sm font-semibold mb-2 block">
                  确认密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            )}

            {/* Remember Me / Forgot Password */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  记住我
                </label>
                <a href="#" className="text-cyan-400 hover:text-cyan-300 text-sm">
                  忘记密码？
                </a>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "处理中..." : isLogin ? "登录" : "注册"}
            </button>
          </form>

          {/* Terms & Privacy */}
          <p className="text-gray-400 text-xs text-center mt-6">
            {isLogin ? "没有账户？" : "已有账户？"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-cyan-400 hover:text-cyan-300 ml-1 font-semibold"
            >
              {isLogin ? "立即注册" : "返回登录"}
            </button>
          </p>

          <p className="text-gray-500 text-xs text-center mt-4">
            使用此应用即表示您同意我们的
            <a href="/terms" className="text-cyan-400 hover:text-cyan-300 ml-1">
              服务条款
            </a>
            和
            <a href="/privacy" className="text-cyan-400 hover:text-cyan-300 ml-1">
              隐私政策
            </a>
          </p>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 animate-fade-in-up">
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-gray-300 text-sm font-semibold">数据监测</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🤖</div>
            <p className="text-gray-300 text-sm font-semibold">AI 分析</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">💡</div>
            <p className="text-gray-300 text-sm font-semibold">健康建议</p>
          </div>
        </div>
      </div>
    </div>
  );
}
