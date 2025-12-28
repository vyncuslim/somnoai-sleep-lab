import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar, TrendingUp, BarChart3 } from "lucide-react";

type TimePeriod = "week" | "month" | "year";

interface TrendData {
  date: string;
  sleepScore: number;
  totalDuration: number;
  deepSleepPercentage: number;
  remPercentage: number;
}

// 模拟数据
const generateMockData = (period: TimePeriod): TrendData[] => {
  const data: TrendData[] = [];
  const now = new Date();
  let daysBack = 7;

  if (period === "month") daysBack = 30;
  if (period === "year") daysBack = 365;

  for (let i = daysBack; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toLocaleDateString("zh-CN", {
        month: "short",
        day: "numeric",
      }),
      sleepScore: Math.floor(Math.random() * 40 + 60),
      totalDuration: Math.floor(Math.random() * 120 + 360),
      deepSleepPercentage: Math.floor(Math.random() * 10 + 10),
      remPercentage: Math.floor(Math.random() * 10 + 15),
    });
  }

  return data;
};

export default function TrendAnalysis() {
  const [period, setPeriod] = useState<TimePeriod>("week");
  const data = generateMockData(period);

  const getPeriodLabel = () => {
    switch (period) {
      case "week":
        return "本周";
      case "month":
        return "本月";
      case "year":
        return "本年";
    }
  };

  const getAverageStats = () => {
    const avgScore = Math.round(
      data.reduce((sum, d) => sum + d.sleepScore, 0) / data.length
    );
    const avgDuration = Math.round(
      data.reduce((sum, d) => sum + d.totalDuration, 0) / data.length
    );
    const avgDeepSleep = Math.round(
      data.reduce((sum, d) => sum + d.deepSleepPercentage, 0) / data.length
    );

    return { avgScore, avgDuration, avgDeepSleep };
  };

  const stats = getAverageStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              趋势分析
            </span>
          </h1>
          <p className="text-gray-400">查看您的睡眠数据波动和长期趋势</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-3 mb-8">
          {(["week", "month", "year"] as TimePeriod[]).map((p) => (
            <Button
              key={p}
              onClick={() => setPeriod(p)}
              variant={period === p ? "default" : "outline"}
              className={
                period === p
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white"
                  : "border-white/20 text-gray-300 hover:text-white"
              }
            >
              {p === "week" ? "周" : p === "month" ? "月" : "年"}
            </Button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glassmorphism p-6 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">平均睡眠评分</p>
                <p className="text-3xl font-bold text-cyan-400">{stats.avgScore}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-cyan-400/30" />
            </div>
          </Card>

          <Card className="glassmorphism p-6 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">平均睡眠时长</p>
                <p className="text-3xl font-bold text-blue-400">
                  {Math.floor(stats.avgDuration / 60)}h
                </p>
              </div>
              <Calendar className="w-12 h-12 text-blue-400/30" />
            </div>
          </Card>

          <Card className="glassmorphism p-6 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">平均深睡比例</p>
                <p className="text-3xl font-bold text-green-400">
                  {stats.avgDeepSleep}%
                </p>
              </div>
              <BarChart3 className="w-12 h-12 text-green-400/30" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sleep Score Trend */}
          <Card className="glassmorphism p-6 border border-white/10 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white mb-4">睡眠评分趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="sleepScore"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ fill: "#06b6d4", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Sleep Duration Trend */}
          <Card className="glassmorphism p-6 border border-white/10 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white mb-4">睡眠时长趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Bar dataKey="totalDuration" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Deep Sleep Percentage */}
          <Card className="glassmorphism p-6 border border-white/10 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white mb-4">深睡比例趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="deepSleepPercentage"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* REM Percentage */}
          <Card className="glassmorphism p-6 border border-white/10 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white mb-4">REM 比例趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="remPercentage"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: "#f59e0b", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Insights */}
        <Card className="glassmorphism p-6 border border-white/10 backdrop-blur-md">
          <h3 className="text-lg font-bold text-white mb-4">数据洞察</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2" />
              <div>
                <p className="text-white font-semibold">睡眠评分</p>
                <p className="text-gray-400 text-sm">
                  {getPeriodLabel()}平均睡眠评分为 {stats.avgScore}
                  分，保持在良好水平。建议继续保持当前的睡眠习惯。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2" />
              <div>
                <p className="text-white font-semibold">睡眠时长</p>
                <p className="text-gray-400 text-sm">
                  {getPeriodLabel()}平均睡眠时长为 {Math.floor(stats.avgDuration / 60)} 小时，
                  {stats.avgDuration < 420
                    ? "略低于建议的 7-9 小时。建议增加睡眠时间。"
                    : "符合健康睡眠建议。"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
              <div>
                <p className="text-white font-semibold">深睡质量</p>
                <p className="text-gray-400 text-sm">
                  {getPeriodLabel()}深睡比例平均为 {stats.avgDeepSleep}%，
                  {stats.avgDeepSleep < 15
                    ? "低于理想水平。建议改善睡眠环境和作息规律。"
                    : "处于良好水平。"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
