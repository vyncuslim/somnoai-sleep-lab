import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";

export default function SleepGoals() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    targetSleepDuration: 480, // 8 hours in minutes
    targetDeepSleepPercentage: 15,
    targetRemPercentage: 20,
    targetSleepEfficiency: 85,
    notifyWhenMissed: 1,
  });

  // Query current goals
  const { data: sleepGoal } = trpc.sleepGoals.get.useQuery();
  const createGoalMutation = trpc.sleepGoals.create.useMutation();
  const updateGoalMutation = trpc.sleepGoals.update.useMutation();

  // Load existing goals
  useEffect(() => {
    if (sleepGoal) {
      setFormData({
        targetSleepDuration: sleepGoal.targetSleepDuration || 480,
        targetDeepSleepPercentage: parseFloat(sleepGoal.targetDeepSleepPercentage as any) || 15,
        targetRemPercentage: parseFloat(sleepGoal.targetRemPercentage as any) || 20,
        targetSleepEfficiency: parseFloat(sleepGoal.targetSleepEfficiency as any) || 85,
        notifyWhenMissed: sleepGoal.notifyWhenMissed || 1,
      });
    }
  }, [sleepGoal]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (sleepGoal) {
        await updateGoalMutation.mutateAsync(formData);
      } else {
        await createGoalMutation.mutateAsync(formData);
      }
      toast.success("睡眠目标已保存");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving sleep goals:", error);
      toast.error("保存失败，请重试");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-down">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎯</div>
            <div>
              <h1 className="text-3xl font-bold text-white">睡眠目标设置</h1>
              <p className="text-gray-400 text-sm">设置您的个人睡眠目标，获得更好的睡眠质量</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-cyan-400">
              返回首页
            </Button>
          </Link>
        </div>

        {/* Current Goals Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="glassmorphism p-6 border border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">目标睡眠时长</p>
                <p className="text-3xl font-bold text-cyan-400">
                  {Math.floor(formData.targetSleepDuration / 60)}h {formData.targetSleepDuration % 60}m
                </p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </Card>

          <Card className="glassmorphism p-6 border border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">目标睡眠效率</p>
                <p className="text-3xl font-bold text-amber-400">{formData.targetSleepEfficiency}%</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </Card>
        </div>

        {/* Edit Form */}
        {isEditing ? (
          <Card className="glassmorphism p-8 border border-white/10 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-white mb-6">编辑睡眠目标</h2>

            <div className="space-y-6">
              {/* Sleep Duration */}
              <div>
                <label className="text-gray-300 text-sm font-semibold mb-3 block">
                  目标睡眠时长（分钟）
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="300"
                    max="600"
                    step="30"
                    value={formData.targetSleepDuration}
                    onChange={(e) => handleInputChange("targetSleepDuration", parseInt(e.target.value))}
                    className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-right min-w-20">
                    <p className="text-cyan-400 font-semibold">
                      {Math.floor(formData.targetSleepDuration / 60)}h {formData.targetSleepDuration % 60}m
                    </p>
                    <p className="text-gray-500 text-xs">{formData.targetSleepDuration}分钟</p>
                  </div>
                </div>
              </div>

              {/* Deep Sleep Percentage */}
              <div>
                <label className="text-gray-300 text-sm font-semibold mb-3 block">
                  目标深睡比例（%）
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={formData.targetDeepSleepPercentage}
                    onChange={(e) => handleInputChange("targetDeepSleepPercentage", parseInt(e.target.value))}
                    className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-right min-w-20">
                    <p className="text-cyan-400 font-semibold">{formData.targetDeepSleepPercentage}%</p>
                  </div>
                </div>
              </div>

              {/* REM Sleep Percentage */}
              <div>
                <label className="text-gray-300 text-sm font-semibold mb-3 block">
                  目标 REM 睡眠比例（%）
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="10"
                    max="35"
                    step="1"
                    value={formData.targetRemPercentage}
                    onChange={(e) => handleInputChange("targetRemPercentage", parseInt(e.target.value))}
                    className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-right min-w-20">
                    <p className="text-cyan-400 font-semibold">{formData.targetRemPercentage}%</p>
                  </div>
                </div>
              </div>

              {/* Sleep Efficiency */}
              <div>
                <label className="text-gray-300 text-sm font-semibold mb-3 block">
                  目标睡眠效率（%）
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="70"
                    max="95"
                    step="1"
                    value={formData.targetSleepEfficiency}
                    onChange={(e) => handleInputChange("targetSleepEfficiency", parseInt(e.target.value))}
                    className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-right min-w-20">
                    <p className="text-cyan-400 font-semibold">{formData.targetSleepEfficiency}%</p>
                  </div>
                </div>
              </div>

              {/* Notification Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <p className="text-gray-300 font-semibold">未达成目标时发送通知</p>
                  <p className="text-gray-500 text-sm">当您的睡眠未达成目标时，将收到提醒</p>
                </div>
                <button
                  onClick={() => handleInputChange("notifyWhenMissed", formData.notifyWhenMissed ? 0 : 1)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    formData.notifyWhenMissed ? "bg-green-500" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      formData.notifyWhenMissed ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50"
              >
                <Save className="w-5 h-5 mr-2" />
                {isSaving ? "保存中..." : "保存目标"}
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="ghost"
                className="flex-1 text-gray-400 hover:text-white"
              >
                取消
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="glassmorphism p-8 border border-white/10 animate-fade-in-up">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">当前睡眠目标</h2>
                <p className="text-gray-400 text-sm mt-1">您已设置了个人睡眠目标</p>
              </div>
              <AlertCircle className="w-6 h-6 text-cyan-400" />
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                <span className="text-gray-300">睡眠时长</span>
                <span className="text-cyan-400 font-semibold">
                  {Math.floor(formData.targetSleepDuration / 60)}h {formData.targetSleepDuration % 60}m
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                <span className="text-gray-300">深睡比例</span>
                <span className="text-cyan-400 font-semibold">{formData.targetDeepSleepPercentage}%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                <span className="text-gray-300">REM 睡眠比例</span>
                <span className="text-cyan-400 font-semibold">{formData.targetRemPercentage}%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                <span className="text-gray-300">睡眠效率</span>
                <span className="text-cyan-400 font-semibold">{formData.targetSleepEfficiency}%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                <span className="text-gray-300">未达成时通知</span>
                <span className={`font-semibold ${formData.notifyWhenMissed ? "text-green-400" : "text-gray-500"}`}>
                  {formData.notifyWhenMissed ? "已启用" : "已禁用"}
                </span>
              </div>
            </div>

            <Button
              onClick={() => setIsEditing(true)}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50"
            >
              编辑目标
            </Button>
          </Card>
        )}

        {/* Tips */}
        <Card className="glassmorphism p-6 border border-white/10 mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">💡 睡眠目标建议</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• 成人每晚应睡眠 7-9 小时（420-540 分钟）</li>
            <li>• 深睡应占总睡眠时间的 13-23%</li>
            <li>• REM 睡眠应占总睡眠时间的 20-25%</li>
            <li>• 睡眠效率应保持在 85% 以上</li>
            <li>• 定期检查并调整目标以适应您的生活方式</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
