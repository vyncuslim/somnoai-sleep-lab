import React, { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

export function GoogleFitTokenStatus() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  // 获取 Token 状态
  const { data: tokenStatus, refetch: refetchTokenStatus, isLoading } = trpc.googleFit.getTokenStatus.useQuery();
  
  // 刷新 Token mutation
  const refreshTokenMutation = trpc.googleFit.refreshToken.useMutation({
    onSuccess: () => {
      setIsRefreshing(false);
      setRefreshError(null);
      // 重新获取 Token 状态
      refetchTokenStatus();
    },
    onError: (error) => {
      setIsRefreshing(false);
      setRefreshError(error.message);
    },
  });

  const handleRefreshToken = async () => {
    setIsRefreshing(true);
    setRefreshError(null);
    refreshTokenMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Google Fit Token 状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin">
              <RefreshCw className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="ml-2 text-sm text-muted-foreground">加载中...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tokenStatus?.connected) {
    return (
      <Card className="w-full border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Google Fit 未连接
          </CardTitle>
          <CardDescription>请连接 Google Fit 以同步您的健身数据</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const tokenExpiry = tokenStatus.tokenExpiry ? new Date(tokenStatus.tokenExpiry) : null;
  const hoursUntilExpiry = tokenStatus.hoursUntilExpiry || 0;
  const daysUntilExpiry = Math.floor(hoursUntilExpiry / 24);
  const remainingHours = Math.floor(hoursUntilExpiry % 24);

  // 确定状态指示器的颜色
  let statusColor = 'text-green-600';
  let statusBgColor = 'bg-green-50';
  let statusBorderColor = 'border-green-200';
  let statusIcon = <CheckCircle className="h-5 w-5" />;
  let statusText = 'Token 有效';

  if (tokenStatus.isExpired) {
    statusColor = 'text-red-600';
    statusBgColor = 'bg-red-50';
    statusBorderColor = 'border-red-200';
    statusIcon = <AlertCircle className="h-5 w-5" />;
    statusText = 'Token 已过期';
  } else if (tokenStatus.isExpiringSoon) {
    statusColor = 'text-orange-600';
    statusBgColor = 'bg-orange-50';
    statusBorderColor = 'border-orange-200';
    statusIcon = <Clock className="h-5 w-5" />;
    statusText = '即将过期';
  }

  return (
    <Card className={`w-full border-2 ${statusBorderColor} ${statusBgColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className={statusColor}>{statusIcon}</span>
          Google Fit Token 状态
        </CardTitle>
        <CardDescription>
          <span className={`font-semibold ${statusColor}`}>{statusText}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token 过期时间 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Token 过期时间</label>
          {tokenExpiry ? (
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                {tokenExpiry.toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {tokenStatus.isExpired
                  ? '已过期'
                  : `${daysUntilExpiry} 天 ${remainingHours} 小时后过期`}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">未知</p>
          )}
        </div>

        {/* 最后刷新时间 */}
        {tokenStatus.lastRefreshTime && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">最后刷新时间</label>
            <p className="text-sm">
              {new Date(tokenStatus.lastRefreshTime).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        )}

        {/* 错误信息 */}
        {refreshError && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-700">
              <span className="font-semibold">刷新失败：</span> {refreshError}
            </p>
          </div>
        )}

        {/* 刷新按钮 */}
        <div className="flex gap-2">
          <Button
            onClick={handleRefreshToken}
            disabled={isRefreshing || tokenStatus.isExpired}
            variant={tokenStatus.isExpiringSoon ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                正在刷新...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                手动刷新 Token
              </>
            )}
          </Button>
          {tokenStatus.isExpired && (
            <p className="text-xs text-red-600 flex items-center">
              Token 已过期，请重新连接 Google Fit
            </p>
          )}
        </div>

        {/* Token 状态指示器 */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="rounded-md bg-background p-2 text-center">
            <p className="text-xs text-muted-foreground">状态</p>
            <p className={`text-sm font-semibold ${statusColor}`}>
              {tokenStatus.isExpired ? '已过期' : tokenStatus.isExpiringSoon ? '即将过期' : '有效'}
            </p>
          </div>
          <div className="rounded-md bg-background p-2 text-center">
            <p className="text-xs text-muted-foreground">剩余时间</p>
            <p className="text-sm font-semibold">
              {tokenStatus.isExpired ? '0' : `${Math.ceil(hoursUntilExpiry)}h`}
            </p>
          </div>
          <div className="rounded-md bg-background p-2 text-center">
            <p className="text-xs text-muted-foreground">连接状态</p>
            <p className="text-sm font-semibold text-green-600">已连接</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
