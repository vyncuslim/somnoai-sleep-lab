import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Settings as SettingsIcon, Bell, Lock, Eye, Moon, Volume2, LogOut } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Settings() {
  const { user, logout } = useAuth();
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    sleepReminders: true,
    darkMode: true,
    soundEnabled: true,
    bedtime: "22:30",
    wakeupTime: "07:00",
  });

  const handleSave = () => {
    toast.success("设置已保存");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-down">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">设置</h1>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-cyan-400">
              返回首页
            </Button>
          </Link>
        </div>

        {/* User Profile Section */}
        <Card className="glassmorphism p-6 mb-6 animate-fade-in-up">
          <h2 className="text-2xl font-semibold text-white mb-4">个人资料</h2>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm">姓名</label>
              <p className="text-white text-lg font-semibold">{user?.name || "未设置"}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">邮箱</label>
              <p className="text-white text-lg font-semibold">{user?.email || "未设置"}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">登录方式</label>
              <p className="text-white text-lg font-semibold capitalize">{user?.loginMethod || "未知"}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">用户角色</label>
              <p className="text-white text-lg font-semibold capitalize">{user?.role || "用户"}</p>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="glassmorphism p-6 mb-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-semibold text-white">通知设置</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <p className="text-white font-semibold">邮件通知</p>
                <p className="text-gray-400 text-sm">接收重要更新和提醒的邮件</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) =>
                  setPreferences({ ...preferences, emailNotifications: e.target.checked })
                }
                className="w-5 h-5 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <p className="text-white font-semibold">睡眠提醒</p>
                <p className="text-gray-400 text-sm">在设定时间提醒您该睡觉了</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.sleepReminders}
                onChange={(e) =>
                  setPreferences({ ...preferences, sleepReminders: e.target.checked })
                }
                className="w-5 h-5 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <p className="text-white font-semibold">声音提醒</p>
                <p className="text-gray-400 text-sm">启用提醒声音</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.soundEnabled}
                onChange={(e) =>
                  setPreferences({ ...preferences, soundEnabled: e.target.checked })
                }
                className="w-5 h-5 cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* Sleep Schedule */}
        <Card className="glassmorphism p-6 mb-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <Moon className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-semibold text-white">睡眠时间表</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm font-semibold mb-2 block">建议睡眠时间</label>
              <input
                type="time"
                value={preferences.bedtime}
                onChange={(e) =>
                  setPreferences({ ...preferences, bedtime: e.target.value })
                }
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm font-semibold mb-2 block">建议起床时间</label>
              <input
                type="time"
                value={preferences.wakeupTime}
                onChange={(e) =>
                  setPreferences({ ...preferences, wakeupTime: e.target.value })
                }
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
          </div>
        </Card>

        {/* Display Settings */}
        <Card className="glassmorphism p-6 mb-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-semibold text-white">显示设置</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <p className="text-white font-semibold">深色模式</p>
                <p className="text-gray-400 text-sm">使用深色主题</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.darkMode}
                onChange={(e) =>
                  setPreferences({ ...preferences, darkMode: e.target.checked })
                }
                className="w-5 h-5 cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* Privacy & Security */}
        <Card className="glassmorphism p-6 mb-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-semibold text-white">隐私与安全</h2>
          </div>
          <div className="space-y-3">
            <Link href="/privacy">
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-cyan-400">
                查看隐私权政策
              </Button>
            </Link>
            <Link href="/terms">
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-cyan-400">
                查看服务条款
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-cyan-400">
              更改密码
            </Button>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 animate-fade-in-up">
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50"
          >
            保存设置
          </Button>
          <Button
            onClick={() => logout()}
            className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 py-3 rounded-lg font-semibold hover:bg-red-500/30"
          >
            <LogOut className="w-5 h-5 mr-2" />
            登出
          </Button>
        </div>

        {/* Danger Zone */}
        <Card className="glassmorphism p-6 mt-8 border-red-500/30 animate-fade-in-up">
          <h2 className="text-2xl font-semibold text-red-400 mb-4">危险区域</h2>
          <p className="text-gray-300 mb-4">
            删除您的账户将永久删除所有数据。此操作无法撤销。
          </p>
          <Button className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30">
            删除账户
          </Button>
        </Card>
      </div>
    </div>
  );
}
