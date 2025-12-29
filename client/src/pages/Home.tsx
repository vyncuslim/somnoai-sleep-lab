import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { Heart, Moon, Zap, TrendingUp, Calendar, Settings, LogOut, Footprints, Flame } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { GoogleFitSync } from "@/components/GoogleFitSync";
import { GoogleFitTokenStatus } from "@/components/GoogleFitTokenStatus";
import { useGuestMode } from "@/App";

// 示例数据
const sleepData = [
  { date: "周一", duration: 7.5, quality: 85 },
  { date: "周二", duration: 6.8, quality: 78 },
  { date: "周三", duration: 8.2, quality: 92 },
  { date: "周四", duration: 7.1, quality: 82 },
  { date: "周五", duration: 6.5, quality: 72 },
  { date: "周六", duration: 9.0, quality: 95 },
  { date: "周日", duration: 8.0, quality: 88 },
];

const sleepStages = [
  { name: "浅睡眠", value: 30, color: "#3b82f6" },
  { name: "深睡眠", value: 45, color: "#8b5cf6" },
  { name: "REM睡眠", value: 25, color: "#ec4899" },
];

const heartRateData = [
  { time: "22:00", rate: 72 },
  { time: "23:00", rate: 68 },
  { time: "00:00", rate: 62 },
  { time: "01:00", rate: 58 },
  { time: "02:00", rate: 56 },
  { time: "03:00", rate: 55 },
  { time: "04:00", rate: 58 },
  { time: "05:00", rate: 65 },
  { time: "06:00", rate: 72 },
  { time: "07:00", rate: 78 },
];

export default function Home() {
  const { isGuest, setIsGuest } = useGuestMode();
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (!isGuest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <Moon className="w-16 h-16 mx-auto text-indigo-400 mb-4" />
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">SomnoAI</h1>
            <p className="text-slate-400 text-sm">数字化睡眠实验室</p>
          </div>
          <p className="text-slate-300 mb-8">
            通过 AI 深度洞察和健康建议，帮助您科学管理睡眠质量
          </p>
          <Button 
            onClick={() => setIsGuest(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-lg font-black text-base uppercase tracking-widest transition-all active:scale-95"
          >
            进入应用
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-black tracking-tight">SomnoAI</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/calendar" className="text-slate-400 hover:text-white transition">
              日历
            </Link>
            <Link href="/trend-analysis" className="text-slate-400 hover:text-white transition">
              趋势
            </Link>
            <Link href="/ai-assistant" className="text-slate-400 hover:text-white transition">
              AI 助手
            </Link>
            <Link href="/settings" className="text-slate-400 hover:text-white transition">
              设置
            </Link>
          </nav>
          <Button 
            onClick={() => setIsGuest(false)}
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            退出
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-black mb-2">欢迎回来</h2>
          <p className="text-slate-400">今天是 {new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Google Fit Sync */}
        <div className="mb-8 space-y-4">
          <GoogleFitSync />
          <GoogleFitTokenStatus />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">睡眠时长</p>
                <p className="text-3xl font-black text-white mt-2">8h 2m</p>
              </div>
              <Moon className="w-8 h-8 text-blue-400" />
            </div>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">睡眠质量</p>
                <p className="text-3xl font-black text-white mt-2">88%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">平均心率</p>
                <p className="text-3xl font-black text-white mt-2">64 bpm</p>
              </div>
              <Heart className="w-8 h-8 text-red-400" />
            </div>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">深睡眠</p>
                <p className="text-3xl font-black text-white mt-2">45%</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sleep Duration Chart */}
          <Card className="bg-slate-800/50 border-slate-700 p-6 lg:col-span-2">
            <h3 className="text-lg font-black mb-4">本周睡眠数据</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sleepData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                <Bar dataKey="duration" fill="#3b82f6" name="睡眠时长(小时)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Sleep Stages Pie Chart */}
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h3 className="text-lg font-black mb-4">睡眠阶段</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sleepStages}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sleepStages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Heart Rate Chart */}
        <Card className="bg-slate-800/50 border-slate-700 p-6 mb-8">
          <h3 className="text-lg font-black mb-4">心率变化</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={heartRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#ec4899" 
                dot={false}
                strokeWidth={2}
                name="心率(bpm)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* AI Insights */}
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <h3 className="text-lg font-black mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            AI 睡眠分析
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-300">
                根据您最近的睡眠数据，您的睡眠质量处于良好水平。建议继续保持规律的睡眠时间，特别是在周末时不要睡得太晚。
              </p>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-300">
                您的深睡眠比例（45%）略低于理想水平（50%）。建议增加运动量和减少屏幕时间，特别是在睡前 1 小时。
              </p>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-300">
                您的平均心率在睡眠中保持稳定，这表明您的睡眠环境和压力水平都很好。继续保持这个状态！
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
