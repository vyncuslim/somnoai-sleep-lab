import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle, RefreshCw, Clock, Zap, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface GoogleFitSyncEnhancedProps {
  onSync?: () => void;
}

export function GoogleFitSyncEnhanced({ onSync }: GoogleFitSyncEnhancedProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  
  // 获取 Google Fit 连接状态
  const getStatus = trpc.googleFit.getStatus.useQuery(undefined, {
    refetchInterval: isSyncing ? 2000 : 5000, // 同步中每 2 秒刷新，否则每 5 秒
  });
  
  // 获取同步历史
  const getSyncHistory = trpc.googleFit.getSyncHistory.useQuery({ limit: 5 });

  const getAuthUrl = trpc.googleFit.getAuthUrl.useQuery(undefined, {
    enabled: false, // 不自动查询
  });

  const handleConnect = async () => {
    try {
      const authUrlResponse = await getAuthUrl.refetch();
      if (authUrlResponse.data?.authUrl) {
        window.location.href = authUrlResponse.data.authUrl;
      }
    } catch (error) {
      console.error("Failed to get auth URL:", error);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncProgress(0);
    
    try {
      // 模拟同步进度
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 30;
        });
      }, 500);

      // 实际同步逻辑会在后端处理
      // 这里只是模拟前端的进度显示
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(progressInterval);
      setSyncProgress(100);
      
      // 刷新状态
      await getStatus.refetch();
      onSync?.();
      
      // 2 秒后重置进度条
      setTimeout(() => {
        setIsSyncing(false);
        setSyncProgress(0);
      }, 2000);
    } catch (error) {
      console.error("Sync failed:", error);
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const status = getStatus.data;
  const isConnected = status?.connected || false;
  const syncStatus = status?.syncStatus || 'idle';
  const lastSyncTime = status?.lastSyncTime ? new Date(status.lastSyncTime) : null;
  const lastSyncDuration = status?.lastSyncDuration;
  const lastSyncError = status?.lastSyncError;

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <TrendingUp className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return '正在同步...';
      case 'success':
        return '同步成功';
      case 'failed':
        return '同步失败';
      default:
        return '准备就绪';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'text-blue-400';
      case 'success':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-cyan-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* 主卡片 */}
      <Card className="p-6 bg-black/30 border-cyan-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Google Fit 连接</h3>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>

        {/* 连接状态 */}
        {isConnected && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
            <p className="text-green-300 text-sm">✓ 已连接到您的 Google Fit 账户</p>
          </div>
        )}

        {/* 错误提示 */}
        {lastSyncError && syncStatus === 'failed' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-300 text-sm">
              <strong>同步失败：</strong> {lastSyncError}
            </p>
          </div>
        )}

        {/* 同步进度条 */}
        {isSyncing && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">同步进度</span>
              <span className="text-sm text-cyan-400">{Math.round(syncProgress)}%</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${syncProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 最后同步信息 */}
        {lastSyncTime && !isSyncing && (
          <div className="bg-black/50 rounded-lg p-3 mb-4 space-y-2">
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>最后同步：{lastSyncTime.toLocaleString('zh-CN')}</span>
            </div>
            {lastSyncDuration && (
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>耗时：{(lastSyncDuration / 1000).toFixed(2)} 秒</span>
              </div>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2">
          {!isConnected ? (
            <Button
              onClick={handleConnect}
              disabled={getStatus.isLoading || getAuthUrl.isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {getStatus.isLoading || getAuthUrl.isLoading ? (
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
                onClick={handleManualSync}
                disabled={isSyncing || getStatus.isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    同步中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    立即同步
                  </>
                )}
              </Button>
              <Button
                onClick={() => getStatus.refetch()}
                disabled={getStatus.isLoading}
                variant="outline"
                className="px-4"
              >
                {getStatus.isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </>
          )}
        </div>

        <p className="text-gray-400 text-xs mt-3">
          {isConnected
            ? "您的 Google Fit 账户已连接。我们将定期同步您的睡眠和心率数据。"
            : "连接您的 Google Fit 账户以自动同步睡眠和心率数据。"}
        </p>
      </Card>

      {/* 同步历史 */}
      {getSyncHistory.data && getSyncHistory.data.length > 0 && (
        <Card className="p-4 bg-black/30 border-cyan-500/20">
          <h4 className="text-sm font-semibold text-cyan-400 mb-3">同步历史</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {getSyncHistory.data.map((sync) => (
              <div
                key={sync.id}
                className="bg-black/50 rounded p-2 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  {sync.status === 'success' && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                  {sync.status === 'failed' && (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  {sync.status === 'syncing' && (
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  )}
                  <div>
                    <p className="text-gray-300">
                      {sync.status === 'success' && '✓ 同步成功'}
                      {sync.status === 'failed' && '✗ 同步失败'}
                      {sync.status === 'syncing' && '⟳ 正在同步'}
                      {sync.status === 'pending' && '⋯ 等待中'}
                    </p>
                    <p className="text-gray-500">
                      {new Date(sync.startTime).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>
                {sync.duration && (
                  <span className="text-gray-400">
                    {(sync.duration / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
