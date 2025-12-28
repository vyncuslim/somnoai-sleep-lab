import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface GoogleFitSyncProps {
  userId: number;
  onSync?: () => void;
}

export function GoogleFitSync({ userId, onSync }: GoogleFitSyncProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");

  useEffect(() => {
    // 检查连接状态
    checkConnectionStatus();
  }, [userId]);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch(`/api/google-fit/status?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.isConnected);
        setLastSyncTime(data.lastSyncAt ? new Date(data.lastSyncAt) : null);
        setSyncStatus(data.syncStatus || "idle");
      }
    } catch (error) {
      console.error("Failed to check connection status:", error);
    }
  };

  const handleConnect = () => {
    // 重定向到 Google OAuth 权限请求页面
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/oauth/google/callback`;
    const scope = [
      "https://www.googleapis.com/auth/fitness.sleep.read",
      "https://www.googleapis.com/auth/fitness.heart_rate.read",
    ].join(" ");

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline`;

    window.location.href = authUrl;
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus("syncing");

    try {
      const response = await fetch("/api/google-fit/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setSyncStatus("success");
        setLastSyncTime(new Date());
        onSync?.();
      } else {
        setSyncStatus("error");
      }
    } catch (error) {
      console.error("Failed to sync:", error);
      setSyncStatus("error");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-cyan-500/30 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-white flex items-center gap-2">
              Google Fit 同步
              {isConnected && <CheckCircle className="w-4 h-4 text-cyan-400" />}
              {!isConnected && <AlertCircle className="w-4 h-4 text-yellow-400" />}
            </h3>
            {lastSyncTime && (
              <p className="text-sm text-gray-400">
                最后同步: {lastSyncTime.toLocaleString("zh-CN")}
              </p>
            )}
            {syncStatus === "error" && (
              <p className="text-sm text-red-400">同步失败，请重试</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {!isConnected ? (
            <Button
              onClick={handleConnect}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              连接 Google Fit
            </Button>
          ) : (
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  同步中...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  立即同步
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {syncStatus === "syncing" && (
        <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-500 animate-pulse"></div>
        </div>
      )}
    </Card>
  );
}
