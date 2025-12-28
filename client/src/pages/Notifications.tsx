import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Bell, Trash2, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { toast } from "sonner";

export default function Notifications() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Query notifications
  const { data: notificationsList = [], isLoading } = trpc.notifications.list.useQuery();
  const { data: unreadNotifications = [] } = trpc.notifications.unread.useQuery();
  const unreadCount = unreadNotifications.length;

  // Mutations
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unread.invalidate();
      toast.success("通知已标记为已读");
    },
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unread.invalidate();
      toast.success("所有通知已标记为已读");
    },
  });

  const deleteNotificationMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unread.invalidate();
      toast.success("通知已删除");
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">请登录查看通知</p>
      </div>
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "sleep_reminder":
        return "🛏️";
      case "heart_rate_alert":
        return "❤️";
      case "goal_achieved":
        return "🎉";
      case "sync_complete":
        return "✅";
      default:
        return "📢";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "sleep_reminder":
        return "bg-blue-100 text-blue-800";
      case "heart_rate_alert":
        return "bg-red-100 text-red-800";
      case "goal_achieved":
        return "bg-green-100 text-green-800";
      case "sync_complete":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">通知中心</h1>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={() => markAllAsReadMutation.mutate()}
              variant="outline"
              className="text-white border-cyan-400 hover:bg-cyan-400/10"
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              全部标记已读
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center text-white">加载中...</div>
          ) : notificationsList.length === 0 ? (
            <Card className="p-8 text-center bg-white/5 border-white/10">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">暂无通知</p>
            </Card>
          ) : (
            notificationsList.map((notification: any) => (
              <Card
                key={notification.id}
                className={`p-4 border-l-4 transition-all ${
                  notification.isRead === 0
                    ? "bg-white/10 border-l-cyan-400 border-white/20"
                    : "bg-white/5 border-l-gray-400 border-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div>
                        <h3 className="text-white font-semibold">
                          {notification.title}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </p>
                      </div>
                    </div>
                    {notification.content && (
                      <p className="text-gray-300 text-sm mb-3">
                        {notification.content}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge className={getNotificationColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      {notification.isRead === 0 && (
                        <Badge className="bg-cyan-500/20 text-cyan-300">
                          未读
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {notification.isRead === 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          markAsReadMutation.mutate({
                            notificationId: notification.id,
                          })
                        }
                        disabled={markAsReadMutation.isPending}
                        className="text-cyan-400 hover:bg-cyan-400/10"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        deleteNotificationMutation.mutate({
                          notificationId: notification.id,
                        })
                      }
                      disabled={deleteNotificationMutation.isPending}
                      className="text-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
