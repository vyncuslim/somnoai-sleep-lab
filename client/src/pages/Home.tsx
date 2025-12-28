import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { Heart, Moon, Zap, TrendingUp, Calendar, Settings, LogOut, Footprints, Flame } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { GoogleFitSync } from "@/components/GoogleFitSync";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Query today's sleep data
  const { data: todaySleep } = trpc.sleep.getToday.useQuery();
  const { data: todayHeartRate } = trpc.heartRate.getToday.useQuery();

  // Google Fit sync handler
  const handleGoogleFitSync = () => {
    // 刷新数据
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-4 gradient-text">SomnoAI</h1>
          <p className="text-xl text-gray-300 mb-8">数字化睡眠实验室</p>
          <p className="text-gray-400 mb-8 max-w-md">
            通过 AI 深度洞察和健康建议，帮助您科学管理睡眠质量
          </p>
          <a href={getLoginUrl()}>
            <Button className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50">
              登录/注册
            </Button>
          </a>
        </div>
      </div>
    );
  }

  // Mock data for visualization
  const sleepScore = Number(todaySleep?.sleepScore) || 78;
  const totalDuration = Number(todaySleep?.totalDuration) || 480;
  const deepSleep = Number(todaySleep?.deepSleepDuration) || 120;
  const remSleep = Number(todaySleep?.remDuration) || 150;
  const lightSleep = Number(todaySleep?.lightSleepDuration) || 180;
  const awake = Number(todaySleep?.awakeDuration) || 30;
  const steps = 8234;
  const calories = 2150;

  const sleepStages = [
    { name: "深睡", value: deepSleep, color: "#0891b2" },
    { name: "REM", value: remSleep, color: "#06b6d4" },
    { name: "浅睡", value: lightSleep, color: "#22d3ee" },
    { name: "清醒", value: awake, color: "#a5f3fc" },
  ];

  const weeklyData = [
    { day: "周一", score: 72 },
    { day: "周二", score: 75 },
    { day: "周三", score: 68 },
    { day: "周四", score: 82 },
    { day: "周五", score: 78 },
    { day: "周六", score: 85 },
    { day: "周日", score: 80 },
  ];

  const heartRateStats = {
    average: Number(todayHeartRate?.averageHeartRate) || 65,
    min: Number(todayHeartRate?.minHeartRate) || 55,
    max: Number(todayHeartRate?.maxHeartRate) || 85,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-down">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">欢迎回来，{user?.name || "用户"}</h1>
            <p className="text-gray-400">
              {new Date().toLocaleDateString("zh-CN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/notifications">
              <Button variant="ghost" className="text-cyan-400 hover:bg-cyan-400/10">
                <Calendar className="w-5 h-5 mr-2" />
                日历
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" className="text-cyan-400 hover:bg-cyan-400/10">
                <Settings className="w-5 h-5 mr-2" />
                设置
              </Button>
            </Link>
            <Button
              onClick={() => logout()}
              variant="ghost"
              className="text-red-400 hover:bg-red-400/10"
            >
              <LogOut className="w-5 h-5 mr-2" />
              登出
            </Button>
          </div>
        </div>

        {/* Sleep Score Ring */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="glassmorphism p-8 col-span-1 flex flex-col items-center justify-center animate-fade-in-up">
            <div className="relative w-48 h-48 mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeDasharray={`${(sleepScore / 100) * 565.48} 565.48`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold text-cyan-400">{sleepScore}</div>
                  <div className="text-gray-400 text-sm">睡眠评分</div>
                </div>
              </div>
            </div>
            <p className="text-gray-300 text-center">
              {Number(sleepScore) >= 80
                ? "优秀的睡眠质量！"
                : Number(sleepScore) >= 60
                ? "睡眠质量良好"
                : "需要改善睡眠"}
            </p>
          </Card>

          {/* Key Metrics */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-2 gap-4">
            <Card className="glassmorphism p-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-300 text-sm font-semibold">总睡眠时长</h3>
                <Moon className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
              </div>
              <p className="text-xs text-gray-400 mt-2">目标: 8小时</p>
            </Card>

            <Card className="glassmorphism p-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-300 text-sm font-semibold">深睡比例</h3>
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {Math.round((deepSleep / totalDuration) * 100)}%
              </div>
              <p className="text-xs text-gray-400 mt-2">目标: 15-20%</p>
            </Card>

            <Card className="glassmorphism p-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-300 text-sm font-semibold">REM 比例</h3>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {Math.round((remSleep / totalDuration) * 100)}%
              </div>
              <p className="text-xs text-gray-400 mt-2">目标: 20-25%</p>
            </Card>

            <Card className="glassmorphism p-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-300 text-sm font-semibold">睡眠效率</h3>
                <Heart className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {todaySleep?.sleepEfficiency || 85}%
              </div>
              <p className="text-xs text-gray-400 mt-2">目标: 85%+</p>
            </Card>
          </div>
        </div>

        {/* Steps & Calories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="glassmorphism p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">今日步数</h3>
              <Footprints className="w-6 h-6 text-green-400" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-4xl font-bold text-green-400">{steps.toLocaleString()}</span>
                  <span className="text-gray-400 text-sm">步</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                    style={{ width: `${Math.min((steps / 10000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">目标: 10,000 步</p>
              </div>
              <div className="p-3 bg-green-400/10 border border-green-400/20 rounded-lg">
                <p className="text-green-300 text-sm">
                  🎯 您已完成每日目标的 {Math.round((steps / 10000) * 100)}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="glassmorphism p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">今日卡路里</h3>
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-4xl font-bold text-orange-400">{calories}</span>
                  <span className="text-gray-400 text-sm">kcal</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full"
                    style={{ width: `${Math.min((calories / 2500) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">建议: 2,500 kcal</p>
              </div>
              <div className="p-3 bg-orange-400/10 border border-orange-400/20 rounded-lg">
                <p className="text-orange-300 text-sm">
                  💪 您已消耗 {Math.round((calories / 2500) * 100)}% 的建议卡路里
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sleep Stages & Heart Rate */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sleep Stages */}
          <Card className="glassmorphism p-6 animate-fade-in-up">
            <h3 className="text-white font-semibold mb-4">睡眠阶段分布</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sleepStages}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {sleepStages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value}分钟`}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {sleepStages.map((stage) => (
                <div key={stage.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="text-xs text-gray-300">
                    {stage.name}: {stage.value}分钟
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Heart Rate */}
          <Card className="glassmorphism p-6 animate-fade-in-up">
            <h3 className="text-white font-semibold mb-4">心率监测</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">平均心率</span>
                <span className="text-2xl font-bold text-cyan-400">
                  {heartRateStats.average} BPM
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">最低心率</span>
                <span className="text-2xl font-bold text-blue-400">
                  {heartRateStats.min} BPM
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">最高心率</span>
                <span className="text-2xl font-bold text-red-400">
                  {heartRateStats.max} BPM
                </span>
              </div>
              <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-gray-300">
                  💡 <strong>健康提示：</strong> 您的心率在正常范围内。保持规律运动和充足睡眠可以进一步改善心率水平。
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Weekly Trend */}
        <Card className="glassmorphism p-6 mb-8 animate-fade-in-up">
          <h3 className="text-white font-semibold mb-4">本周睡眠评分趋势</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(6, 182, 212, 0.3)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="score" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* AI Insights */}
        <Card className="glassmorphism p-6 animate-fade-in-up">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>🤖</span> AI 睡眠洞察
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
              <p className="text-cyan-300 text-sm">
                ✨ 您最近的睡眠质量有所提升。建议继续保持规律的睡眠时间表。
              </p>
            </div>
            <div className="p-4 bg-blue-400/10 border border-blue-400/20 rounded-lg">
              <p className="text-blue-300 text-sm">
                💡 您的深睡时间略低于目标。尝试在睡前30分钟放松，可能有助于改善深睡质量。
              </p>
            </div>
            <div className="p-4 bg-purple-400/10 border border-purple-400/20 rounded-lg">
              <p className="text-purple-300 text-sm">
                🎯 您的心率在睡眠期间保持稳定。这表明您的睡眠环境相当舒适。
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
