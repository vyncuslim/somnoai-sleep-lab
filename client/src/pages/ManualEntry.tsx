import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Heart, Zap, Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface SleepRecord {
  date: string;
  totalDuration: number;
  deepSleepPercentage: number;
  remPercentage: number;
  lightSleepPercentage: number;
  awakePercentage: number;
  qualityScore: number;
  averageHeartRate: number;
  minHeartRate: number;
  maxHeartRate: number;
  notes: string;
}

export default function ManualEntry() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SleepRecord>({
    date: new Date().toISOString().split("T")[0],
    totalDuration: 480,
    deepSleepPercentage: 15,
    remPercentage: 20,
    lightSleepPercentage: 50,
    awakePercentage: 15,
    qualityScore: 78,
    averageHeartRate: 65,
    minHeartRate: 55,
    maxHeartRate: 85,
    notes: "",
  });

  const { data: records = [], refetch } = trpc.sleep.getRecords.useQuery({});
  const createMutation = trpc.sleep.createManualRecord.useMutation({
    onSuccess: () => {
      toast.success("睡眠记录已保存");
      setFormData({
        date: new Date().toISOString().split("T")[0],
        totalDuration: 480,
        deepSleepPercentage: 15,
        remPercentage: 20,
        lightSleepPercentage: 50,
        awakePercentage: 15,
        qualityScore: 78,
        averageHeartRate: 65,
        minHeartRate: 55,
        maxHeartRate: 85,
        notes: "",
      });
      setIsAdding(false);
      refetch();
    },
    onError: () => {
      toast.error("保存失败，请重试");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证百分比总和
    const totalPercentage =
      formData.deepSleepPercentage +
      formData.remPercentage +
      formData.lightSleepPercentage +
      formData.awakePercentage;

    if (Math.abs(totalPercentage - 100) > 1) {
      toast.error("睡眠阶段百分比总和必须为 100%");
      return;
    }

    // 验证心率数据
    if (formData.minHeartRate > formData.maxHeartRate) {
      toast.error("最低心率不能大于最高心率");
      return;
    }

    if (
      formData.averageHeartRate < formData.minHeartRate ||
      formData.averageHeartRate > formData.maxHeartRate
    ) {
      toast.error("平均心率必须在最低和最高心率之间");
      return;
    }

    createMutation.mutate({
      recordDate: new Date(formData.date),
      totalDuration: formData.totalDuration,
      deepSleepPercentage: formData.deepSleepPercentage,
      remPercentage: formData.remPercentage,
      lightSleepPercentage: formData.lightSleepPercentage,
      awakePercentage: formData.awakePercentage,
      qualityScore: formData.qualityScore,
      averageHeartRate: formData.averageHeartRate,
      minHeartRate: formData.minHeartRate,
      maxHeartRate: formData.maxHeartRate,
      notes: formData.notes,
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              手动数据录入
            </span>
          </h1>
          <p className="text-gray-400">补录您的睡眠数据和健康指标</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Card */}
          <div className="lg:col-span-1">
            <Card className="glassmorphism p-6 border border-white/10 backdrop-blur-md sticky top-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                新增记录
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Date */}
                <div>
                  <Label className="text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    日期
                  </Label>
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="bg-white/10 border border-white/20 text-white"
                  />
                </div>

                {/* Total Duration */}
                <div>
                  <Label className="text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    总睡眠时长 (分钟)
                  </Label>
                  <Input
                    type="number"
                    name="totalDuration"
                    value={formData.totalDuration}
                    onChange={handleInputChange}
                    min="0"
                    max="1440"
                    className="bg-white/10 border border-white/20 text-white"
                  />
                </div>

                {/* Sleep Stages */}
                <div className="space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-gray-300 text-sm font-semibold">睡眠阶段占比 (%)</p>

                  <div>
                    <Label className="text-gray-400 text-xs">深睡</Label>
                    <Input
                      type="number"
                      name="deepSleepPercentage"
                      value={formData.deepSleepPercentage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="bg-white/10 border border-white/20 text-white text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-400 text-xs">REM</Label>
                    <Input
                      type="number"
                      name="remPercentage"
                      value={formData.remPercentage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="bg-white/10 border border-white/20 text-white text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-400 text-xs">浅睡</Label>
                    <Input
                      type="number"
                      name="lightSleepPercentage"
                      value={formData.lightSleepPercentage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="bg-white/10 border border-white/20 text-white text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-400 text-xs">清醒</Label>
                    <Input
                      type="number"
                      name="awakePercentage"
                      value={formData.awakePercentage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="bg-white/10 border border-white/20 text-white text-sm"
                    />
                  </div>

                  <p className="text-xs text-gray-500">
                    总计:{" "}
                    {formData.deepSleepPercentage +
                      formData.remPercentage +
                      formData.lightSleepPercentage +
                      formData.awakePercentage}
                    %
                  </p>
                </div>

                {/* Quality Score */}
                <div>
                  <Label className="text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    睡眠质量评分 (0-100)
                  </Label>
                  <Input
                    type="number"
                    name="qualityScore"
                    value={formData.qualityScore}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="bg-white/10 border border-white/20 text-white"
                  />
                </div>

                {/* Heart Rate */}
                <div className="space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-gray-300 text-sm font-semibold flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    心率 (BPM)
                  </p>

                  <div>
                    <Label className="text-gray-400 text-xs">平均</Label>
                    <Input
                      type="number"
                      name="averageHeartRate"
                      value={formData.averageHeartRate}
                      onChange={handleInputChange}
                      min="0"
                      max="200"
                      className="bg-white/10 border border-white/20 text-white text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-400 text-xs">最低</Label>
                    <Input
                      type="number"
                      name="minHeartRate"
                      value={formData.minHeartRate}
                      onChange={handleInputChange}
                      min="0"
                      max="200"
                      className="bg-white/10 border border-white/20 text-white text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-400 text-xs">最高</Label>
                    <Input
                      type="number"
                      name="maxHeartRate"
                      value={formData.maxHeartRate}
                      onChange={handleInputChange}
                      min="0"
                      max="200"
                      className="bg-white/10 border border-white/20 text-white text-sm"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label className="text-gray-300 text-sm font-semibold mb-2">
                    备注
                  </Label>
                  <Textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="记录任何特殊情况或感受..."
                    className="bg-white/10 border border-white/20 text-white min-h-24"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                >
                  {createMutation.isPending ? "保存中..." : "保存记录"}
                </Button>
              </form>
            </Card>
          </div>

          {/* Records List */}
          <div className="lg:col-span-2">
            <Card className="glassmorphism p-6 border border-white/10 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-6">最近的记录</h2>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {records.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    暂无记录，开始添加您的第一条睡眠数据
                  </p>
                ) : (
                  records.map((record: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-white font-semibold">
                            {new Date(record.recordDate).toLocaleDateString(
                              "zh-CN"
                            )}
                          </p>
                          <p className="text-gray-400 text-sm">
                            睡眠评分: {record.qualityScore}分
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-cyan-400">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-400">总时长:</span>
                          <span className="text-cyan-400 ml-2">
                            {Math.round(record.totalDuration / 60)}h{" "}
                            {record.totalDuration % 60}m
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">深睡:</span>
                          <span className="text-cyan-400 ml-2">
                            {record.deepSleepPercentage}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">平均心率:</span>
                          <span className="text-red-400 ml-2">
                            {record.averageHeartRate} BPM
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">REM:</span>
                          <span className="text-cyan-400 ml-2">
                            {record.remPercentage}%
                          </span>
                        </div>
                      </div>

                      {record.notes && (
                        <p className="text-gray-400 text-xs mt-3 italic">
                          备注: {record.notes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
