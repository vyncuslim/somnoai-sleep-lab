import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface GoogleFitSyncProps {
  onSync?: () => void;
}

export function GoogleFitSync({ onSync }: GoogleFitSyncProps) {
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 获取 Google Fit 授权 URL
  const getAuthUrl = trpc.googleFit.getAuthUrl.useQuery();
  
  // 获取 Google Fit 连接状态
  const getStatus = trpc.googleFit.getStatus.useQuery();

  const handleConnect = async () => {
    try {
      setSyncStatus("syncing");
      setErrorMessage(null);

      if (!getAuthUrl.data?.authUrl) {
        throw new Error("Failed to get auth URL");
      }

      // 重定向到 Google OAuth 授权页面
      window.location.href = getAuthUrl.data.authUrl;
    } catch (error) {
      console.error("Failed to connect Google Fit:", error);
      setSyncStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to connect Google Fit");
    }
  };

  const handleRefresh = () => {
    getStatus.refetch();
  };

  const isConnected = getStatus.data?.connected || false;
  const lastSync = getStatus.data?.lastSync ? new Date(getStatus.data.lastSync) : null;

  return (
    <Card className="p-6 bg-black/30 border-cyan-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Google Fit 连接</h3>
        {isConnected && (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">已连接</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{errorMessage}</p>
        </div>
      )}

      <p className="text-gray-300 text-sm mb-4">
        {isConnected
          ? "您的 Google Fit 账户已连接。我们将定期同步您的睡眠和心率数据。"
          : "连接您的 Google Fit 账户以自动同步睡眠和心率数据。"}
      </p>

      <div className="flex gap-2">
        {!isConnected ? (
          <Button
            onClick={handleConnect}
            disabled={getAuthUrl.isLoading || syncStatus === "syncing"}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {syncStatus === "syncing" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                连接中...
              </>
            ) : getAuthUrl.isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                加载中...
              </>
            ) : (
              "连接 Google Fit"
            )}
          </Button>
        ) : (
          <>
            <Button
              onClick={handleRefresh}
              disabled={getStatus.isLoading}
              variant="outline"
              className="flex-1"
            >
              {getStatus.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  刷新中...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  刷新状态
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {lastSync && (
        <p className="text-gray-400 text-xs mt-3">
          最后同步: {lastSync.toLocaleString("zh-CN")}
        </p>
      )}
    </Card>
  );
}
