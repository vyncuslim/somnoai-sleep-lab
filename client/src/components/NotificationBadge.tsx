import { trpc } from "@/lib/trpc";
import { Bell } from "lucide-react";
import { Link } from "wouter";

export function NotificationBadge() {
  const { data: unreadNotifications = [] } = trpc.notifications.unread.useQuery();
  const unreadCount = unreadNotifications.length;

  if (unreadCount === 0) {
    return (
      <Link href="/notifications">
        <Bell className="w-5 h-5 text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer" />
      </Link>
    );
  }

  return (
    <Link href="/notifications">
      <div className="relative inline-block cursor-pointer">
        <Bell className="w-5 h-5 text-cyan-400 hover:text-cyan-300 transition-colors" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      </div>
    </Link>
  );
}
