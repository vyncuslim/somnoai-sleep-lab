import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: records } = trpc.sleep.getRecords.useQuery({});

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getRecordForDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return records?.find(
      (r) =>
        new Date(r.recordDate).toDateString() === date.toDateString()
    );
  };

  const getSleepScoreColor = (score: string | number | null) => {
    const numScore = typeof score === "string" ? parseInt(score) : score || 0;
    if (numScore >= 80) return "bg-green-500/20 border-green-500";
    if (numScore >= 60) return "bg-yellow-500/20 border-yellow-500";
    return "bg-red-500/20 border-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              睡眠日历
            </span>
          </h1>
          <p className="text-gray-400">查看您的睡眠历史记录</p>
        </div>

        {/* Calendar Card */}
        <Card className="glassmorphism p-8 border border-white/10 backdrop-blur-md">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={handlePrevMonth}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-bold text-white">
              {currentDate.toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
              })}
            </h2>
            <Button
              onClick={handleNextMonth}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
              <div
                key={day}
                className="text-center text-gray-400 font-semibold py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Days of month */}
            {days.map((day) => {
              const record = getRecordForDate(day);
              const score = record?.sleepScore || 0;

              return (
                <button
                  key={day}
                  onClick={() =>
                    setSelectedDate(
                      new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                    )
                  }
                  className={`aspect-square rounded-lg border-2 transition-all flex flex-col items-center justify-center text-sm font-semibold ${
                    record
                      ? getSleepScoreColor(record.sleepScore)
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  <span className="text-lg">{day}</span>
                  {record && (
                    <span className="text-xs text-cyan-400 mt-1">{record.sleepScore}分</span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Selected Date Details */}
        {selectedDate && (
          <Card className="glassmorphism p-8 mt-8 border border-white/10 backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-4">
              {selectedDate.toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              的睡眠数据
            </h3>

            {getRecordForDate(selectedDate.getDate()) ? (
              <div className="grid grid-cols-2 gap-4">
                {(() => {
                  const record = getRecordForDate(selectedDate.getDate());
                  return (
                    <>
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <p className="text-gray-400 text-sm mb-1">睡眠评分</p>
                        <p className="text-3xl font-bold text-cyan-400">
                          {record?.sleepScore}分
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <p className="text-gray-400 text-sm mb-1">睡眠时长</p>
                        <p className="text-3xl font-bold text-blue-400">
                          {record?.totalDuration}小时
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <p className="text-gray-400 text-sm mb-1">深睡比例</p>
                        <p className="text-3xl font-bold text-purple-400">
                          {record?.deepSleepDuration ? Math.round((record.deepSleepDuration / (record.totalDuration || 1)) * 100) : 0}%
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <p className="text-gray-400 text-sm mb-1">清醒时间</p>
                        <p className="text-3xl font-bold text-pink-400">
                          {record?.awakeDuration || 0}分钟
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <p className="text-gray-400">该日期没有睡眠数据</p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
