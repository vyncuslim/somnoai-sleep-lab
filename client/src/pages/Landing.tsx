import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Heart, Moon, Brain, TrendingUp, Lock, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Moon className="w-8 h-8 text-cyan-400" />
          <h1 className="text-2xl font-bold text-white">SomnoAI Digital Sleep Lab</h1>
        </div>
        <div className="flex items-center gap-4">
          <a href="/privacypolicy" className="text-gray-300 hover:text-cyan-400 transition text-sm">
            隐私政策
          </a>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            登录
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-white mb-6">
          您的个人睡眠健康助手
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          SomnoAI Digital Sleep Lab 是一个智能睡眠管理应用，帮助您追踪睡眠数据、分析睡眠质量、获取 AI 个性化建议，从而改善睡眠健康。
        </p>
        <Button
          onClick={() => (window.location.href = getLoginUrl())}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 text-lg"
        >
          开始使用
        </Button>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-white mb-12 text-center">核心功能</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-cyan-500/30 rounded-lg p-6 backdrop-blur-sm hover:border-cyan-500/60 transition">
            <Heart className="w-12 h-12 text-cyan-400 mb-4" />
            <h4 className="text-xl font-semibold text-white mb-2">Google Fit 集成</h4>
            <p className="text-gray-300">
              自动同步您的 Google Fit 睡眠数据、心率、步数和卡路里信息，实时掌握健康状况。
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-cyan-500/30 rounded-lg p-6 backdrop-blur-sm hover:border-cyan-500/60 transition">
            <Brain className="w-12 h-12 text-purple-400 mb-4" />
            <h4 className="text-xl font-semibold text-white mb-2">AI 智能建议</h4>
            <p className="text-gray-300">
              使用 Gemini AI 分析您的睡眠数据，提供个性化的睡眠改善建议和健康指导。
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-cyan-500/30 rounded-lg p-6 backdrop-blur-sm hover:border-cyan-500/60 transition">
            <TrendingUp className="w-12 h-12 text-green-400 mb-4" />
            <h4 className="text-xl font-semibold text-white mb-2">数据分析</h4>
            <p className="text-gray-300">
              查看周/月/年的睡眠趋势，了解睡眠质量变化，追踪改善进度。
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-cyan-500/30 rounded-lg p-6 backdrop-blur-sm hover:border-cyan-500/60 transition">
            <Zap className="w-12 h-12 text-yellow-400 mb-4" />
            <h4 className="text-xl font-semibold text-white mb-2">目标管理</h4>
            <p className="text-gray-300">
              设置个性化睡眠目标，系统每天自动检查目标达成情况，并发送提醒。
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-cyan-500/30 rounded-lg p-6 backdrop-blur-sm hover:border-cyan-500/60 transition">
            <Moon className="w-12 h-12 text-indigo-400 mb-4" />
            <h4 className="text-xl font-semibold text-white mb-2">睡眠日历</h4>
            <p className="text-gray-300">
              直观的日历视图展示每天的睡眠数据，轻松查看睡眠历史和模式。
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-cyan-500/30 rounded-lg p-6 backdrop-blur-sm hover:border-cyan-500/60 transition">
            <Lock className="w-12 h-12 text-red-400 mb-4" />
            <h4 className="text-xl font-semibold text-white mb-2">隐私保护</h4>
            <p className="text-gray-300">
              您的数据安全是我们的首要任务。所有数据都经过加密保护，隐私政策完全透明。
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-20 bg-slate-800/30 border-y border-cyan-500/20">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-12 text-center">如何使用</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-cyan-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">登录账户</h4>
              <p className="text-gray-300">使用 Google 账户登录应用</p>
            </div>
            <div className="text-center">
              <div className="bg-cyan-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">连接 Google Fit</h4>
              <p className="text-gray-300">授权应用访问您的睡眠数据</p>
            </div>
            <div className="text-center">
              <div className="bg-cyan-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">查看分析</h4>
              <p className="text-gray-300">在 Dashboard 中查看睡眠数据</p>
            </div>
            <div className="text-center">
              <div className="bg-cyan-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">获取建议</h4>
              <p className="text-gray-300">与 AI 聊天获取个性化建议</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 text-center">
        <h3 className="text-3xl font-bold text-white mb-6">准备好改善您的睡眠了吗？</h3>
        <p className="text-xl text-gray-300 mb-8">立即开始使用 SomnoAI Digital Sleep Lab</p>
        <Button
          onClick={() => (window.location.href = getLoginUrl())}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 text-lg"
        >
          立即登录
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 px-6 py-8 text-center text-gray-400">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center gap-6 mb-4">
            <a href="/privacypolicy" className="hover:text-cyan-400 transition">
              隐私权政策
            </a>
            <a href="/termsofservice" className="hover:text-cyan-400 transition">
              服务条款
            </a>
            <a href="mailto:support@somnoai.com" className="hover:text-cyan-400 transition">
              联系我们
            </a>
          </div>
          <p>&copy; 2025 SomnoAI Digital Sleep Lab. 保留所有权利。</p>
        </div>
      </footer>
    </div>
  );
}
