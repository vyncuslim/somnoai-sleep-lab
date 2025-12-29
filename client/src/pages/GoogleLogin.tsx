import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface GoogleSignInResponse {
  credential: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  useEffect(() => {
    // 加载 Google Sign-In 脚本
    const loadGoogleSDK = () => {
      // 检查是否已经加载过
      if (window.google?.accounts?.id) {
        console.log("✓ Google SDK 已加载");
        setGoogleLoaded(true);
        initializeGoogleSignIn();
        return;
      }

      // 检查脚本是否已存在
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        console.log("✓ Google SDK 脚本已存在");
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("✓ Google SDK 已加载");
        setGoogleLoaded(true);
        // 延迟初始化以确保 window.google 已准备好
        setTimeout(() => {
          initializeGoogleSignIn();
        }, 100);
      };
      script.onerror = () => {
        console.error("✗ Google SDK 加载失败");
        setGoogleLoaded(false);
      };
      document.head.appendChild(script);
    };

    loadGoogleSDK();

    return () => {
      // 不移除脚本，因为它可能被其他组件使用
    };
  }, []);

  const initializeGoogleSignIn = () => {
    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "312904526470-84ra3lld33sci0kvhset8523b0hdul1c.apps.googleusercontent.com",
          callback: handleGoogleSignIn,
          auto_select: false,
          itp_support: true,
        });

        const buttonElement = document.getElementById("google-signin-button");
        if (buttonElement) {
          window.google.accounts.id.renderButton(buttonElement, {
            type: "standard",
            theme: "dark",
            size: "large",
            text: "signin_with",
            width: "100%",
          });
        }
      } else {
        console.warn("Google SDK 尚未加载，将重试...");
        setTimeout(initializeGoogleSignIn, 500);
      }
    } catch (error) {
      console.error("初始化 Google Sign-In 失败:", error);
    }
  };

  const handleGoogleSignIn = async (response: GoogleSignInResponse) => {
    setIsLoading(true);
    try {
      // 将 JWT token 发送到后端进行验证和用户创建
      const result = await fetch("/api/auth/google-signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: response.credential,
        }),
      });

      if (result.ok) {
        const data = await result.json();
        toast.success("Google 登录成功");
        // 重定向到首页
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      } else {
        const error = await result.json();
        toast.error(error.message || "Google 登录失败");
      }
    } catch (error) {
      console.error("Google Sign-In error:", error);
      toast.error("Google 登录出错");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGoogleFit = async () => {
    setIsLoading(true);
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "312904526470-84ra3lld33sci0kvhset8523b0hdul1c.apps.googleusercontent.com";
      const redirectUri = `${window.location.origin}/api/google-fit/callback`;
      const scope = "https://www.googleapis.com/auth/fitness.sleep.read https://www.googleapis.com/auth/fitness.heart_rate.read";
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline`;
      
      window.location.href = authUrl;
    } catch (error) {
      console.error("Error connecting Google Fit:", error);
      toast.error("连接 Google Fit 失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("请输入邮箱和密码");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/email-login" : "/api/auth/email-signup";
      const body = isLogin 
        ? { email, password }
        : { email, password, confirmPassword };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(isLogin ? "登录成功" : "注册成功");
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      } else {
        const error = await response.json();
        toast.error(error.message || (isLogin ? "登录失败" : "注册失败"));
      }
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
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              SomnoAI
            </span>
          </h1>
          <p className="text-xl text-gray-300">数字化睡眠实验室</p>
          <p className="text-gray-400 text-sm mt-2">
            通过 AI 深度洞察和健康建议，帮助您科学管理睡眠质量
          </p>
        </div>

        {/* Login Card */}
        <Card className="glassmorphism p-8 animate-fade-in-up border border-white/10 backdrop-blur-md">
          {/* Tab Buttons */}
          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                isLogin
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                !isLogin
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              注册
            </button>
          </div>

          {/* Google Sign-In Button */}
          <div id="google-signin-button" className="mb-6 flex justify-center" />

          {/* Connect Google Fit Button */}
          <button
            onClick={handleConnectGoogleFit}
            disabled={isLoading}
            className="w-full mb-6 py-3 px-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                连接中...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                连接 Google Fit
              </>
            )}
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
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  disabled={isLoading}
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
                  className="w-full pl-10 pr-10 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input (Register Only) */}
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
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {isLogin ? "登录中..." : "注册中..."}
                </>
              ) : (
                isLogin ? "登录" : "注册"
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center text-gray-400 text-sm space-y-2">
            <p>
              <button
                onClick={() => window.open("/privacy", "_blank")}
                className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                隐私政策
              </button>
              {" • "}
              <button
                onClick={() => window.open("/terms", "_blank")}
                className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                服务条款
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
