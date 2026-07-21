"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiBell,
  FiCheckCircle,
  FiShoppingBag,
  FiTag,
  FiTrash2,
  FiCheck,
  FiLoader,
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import useNotificationStore from "../stores/useNotificationsStore";

function NotificationsContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotificationStore();

  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth?mode=signin");
    } else if (user?.id) {
      fetchNotifications(user.id);
    }
  }, [user, authLoading, router, fetchNotifications]);

  const rawName = user?.name || user?.customerName || user?.displayName || user?.email?.split("@")[0] || "Fan";
  const firstName = rawName.split(" ")[0];

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead && !n.read;
    if (filter === "order") return n.type === "order";
    if (filter === "promo") return n.type === "promo";
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case "order":
        return <FiShoppingBag className="text-orange-500" size={18} />;
      case "promo":
        return <FiTag className="text-green-500" size={18} />;
      default:
        return <FiBell className="text-blue-500" size={18} />;
    }
  };

  if (authLoading || isLoading) {
    return <NotificationsFallback />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-zinc-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950 flex items-center gap-2.5">
              <FiBell className="text-orange-500 shrink-0" />
              <span>Welcome back, <span className="text-orange-500">{firstName}</span>!</span>
            </h1>
            <p className="text-gray-400 text-xs mt-1">
              Stay updated with your kit orders, delivery alerts, and promo drops.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => markAllAsRead(user?.id)}
              type="button"
              className="text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer border-none outline-none"
            >
              <FiCheck size={14} /> Mark All Read
            </button>
            <button
              onClick={() => clearAllNotifications(user?.id)}
              type="button"
              className="text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer border-none outline-none"
            >
              <FiTrash2 size={14} /> Clear All
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { id: "all", label: "All" },
            { id: "unread", label: "Unread" },
            { id: "order", label: "Orders" },
            { id: "promo", label: "Promos" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border-none outline-none ${
                filter === item.id
                  ? "bg-[#111827] text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto">
              <FiCheckCircle size={24} />
            </div>
            <h3 className="font-bold text-base text-zinc-900">You're all caught up, {firstName}!</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              No new notifications found for this filter. Check back later for order updates!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(user?.id, notification.id)}
                className={`bg-white rounded-2xl border p-5 transition-all duration-200 shadow-sm flex items-start justify-between gap-4 cursor-pointer ${
                  !notification.isRead && !notification.read
                    ? "border-orange-400 ring-1 ring-orange-400/10 bg-orange-50/20"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="p-3 bg-gray-50 rounded-xl shrink-0 border border-gray-100">
                    {getIcon(notification.type)}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-zinc-900 truncate">
                        {notification.title}
                      </h4>
                      {(!notification.isRead && !notification.read) && (
                        <span className="bg-orange-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-4 pt-1">
                      <span className="text-[10px] font-semibold text-gray-400">
                        {new Date(notification.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {notification.link && (
                        <Link
                          href={notification.link}
                          className="text-[11px] font-bold text-orange-500 hover:underline"
                        >
                          View Details &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(user?.id, notification.id);
                  }}
                  type="button"
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer border-none outline-none"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

function NotificationsFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
      <FiLoader className="animate-spin text-orange-500" size={32} />
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
        Loading Notifications...
      </p>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<NotificationsFallback />}>
      <NotificationsContent />
    </Suspense>
  );
}