import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function useNotifications() {
  const utils = trpc.useUtils();

  // Query hooks
  const notificationsQuery = trpc.notifications.list.useQuery();
  const unreadQuery = trpc.notifications.unread.useQuery();

  // Mutations
  const createNotificationMutation = trpc.notifications.create.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unread.invalidate();
    },
  });

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unread.invalidate();
    },
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unread.invalidate();
    },
  });

  const deleteNotificationMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unread.invalidate();
    },
  });

  // Helper functions
  const createNotification = async (
    title: string,
    content?: string,
    type: string = "info",
    actionUrl?: string
  ) => {
    try {
      await createNotificationMutation.mutateAsync({
        title,
        content,
        type,
        actionUrl,
      });
      toast.success("通知已创建");
    } catch (error) {
      toast.error("创建通知失败");
      console.error(error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await markAsReadMutation.mutateAsync({ notificationId });
    } catch (error) {
      toast.error("标记失败");
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      toast.success("所有通知已标记为已读");
    } catch (error) {
      toast.error("标记失败");
      console.error(error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      await deleteNotificationMutation.mutateAsync({ notificationId });
      toast.success("通知已删除");
    } catch (error) {
      toast.error("删除失败");
      console.error(error);
    }
  };

  return {
    // Data
    notifications: notificationsQuery.data || [],
    unreadNotifications: unreadQuery.data || [],
    unreadCount: (unreadQuery.data || []).length,
    isLoading: notificationsQuery.isLoading,

    // Mutations
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,

    // Mutation states
    isCreating: createNotificationMutation.isPending,
    isMarking: markAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
  };
}
