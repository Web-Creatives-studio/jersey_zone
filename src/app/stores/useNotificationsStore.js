import { create } from "zustand";

const useNotificationStore = create((set, get) => ({
  notifications: [],
  isLoading: false,

  fetchNotifications: async (userId) => {
    if (!userId) return;
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/notifications/user?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        set({ notifications: data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.error("Failed fetching user notifications store:", err);
      set({ isLoading: false });
    }
  },

  markAsRead: async (userId, notificationId) => {
    if (!userId || !notificationId) return;

    // Optimistic UI Update
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true, read: true } : n
      ),
    }));

    try {
      await fetch("/api/notifications/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, notificationId }),
      });
    } catch (err) {
      console.error("Failed marking notification read:", err);
    }
  },

  markAllAsRead: async (userId) => {
    if (!userId) return;

    // Optimistic UI Update
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        isRead: true,
        read: true,
      })),
    }));

    try {
      await fetch("/api/notifications/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, markAllRead: true }),
      });
    } catch (err) {
      console.error("Failed marking all notifications read:", err);
    }
  },

  deleteNotification: async (userId, notificationId) => {
    if (!notificationId) return;

    // Optimistic UI Update
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== notificationId),
    }));

    try {
      await fetch(`/api/notifications/user?id=${notificationId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed deleting notification:", err);
    }
  },

  clearAllNotifications: async (userId) => {
    if (!userId) return;

    // Optimistic UI Update
    set({ notifications: [] });

    try {
      await fetch(`/api/notifications/user?userId=${userId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed clearing notifications:", err);
    }
  },

  getUnreadCount: () => {
    const list = get().notifications;
    if (!Array.isArray(list)) return 0;
    return list.filter((n) => n.isRead === false || n.read === false).length;
  },
}));

export default useNotificationStore;