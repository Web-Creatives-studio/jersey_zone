"use client";

import React, { useState, useEffect, Suspense } from "react";
import { FiLoader } from "react-icons/fi";

// Force request-time execution
export const dynamic = "force-dynamic";

function NotificationsContent() {
  const [filterType, setFilterType] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("Syncing logs...");

  useEffect(() => {
    let eventSource = null;
    let fallbackInterval = null;

    // 1. Fetch historical records on mount
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/notifications/history");
        if (res.ok) {
          const data = await res.json();
          if (data.logs) setNotifications(data.logs);
          setConnectionStatus("Live");
        }
      } catch (err) {
        console.error("Historical load error:", err);
        setConnectionStatus("Offline Feed Mode");
      }
    };

    fetchHistory();

    // 2. Persistent Real-time EventSource Stream
    try {
      eventSource = new EventSource("/api/notifications");

      eventSource.onopen = () => {
        setConnectionStatus("Live");
      };

      eventSource.onmessage = (event) => {
        try {
          const incomingLog = JSON.parse(event.data);
          setNotifications((prev) => {
            // Avoid duplicate notifications in UI
            if (prev.some((n) => n.id === incomingLog.id)) return prev;
            return [incomingLog, ...prev];
          });
        } catch (err) {
          console.error("Error reading notification buffer stream:", err);
        }
      };

      eventSource.onerror = () => {
        // 🌟 SERVERLESS FALLBACK: If SSE gets closed by Vercel serverless timeouts, switch to polling
        console.warn("SSE disconnected. Initiating backup polling sync...");
        setConnectionStatus("Live (Backup Sync)");
        if (eventSource) eventSource.close();

        fallbackInterval = setInterval(async () => {
          try {
            const res = await fetch("/api/notifications/history");
            if (res.ok) {
              const data = await res.json();
              if (data.logs) {
                setNotifications(data.logs);
              }
            }
          } catch (err) {
            console.error("Backup sync failure:", err);
          }
        }, 3000); // Polls database every 8 seconds on serverless environments
      };
    } catch (err) {
      console.error("SSE Connection initial initialization failure:", err);
    }

    return () => {
      if (eventSource) eventSource.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, []);

  const markAllRead = async () => {
    // Optimistic UI Update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      const response = await fetch("/api/notifications/read", {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) throw new Error("Database mutation failed");
    } catch (error) {
      console.error("Failed to sync read notifications to cloud:", error);
    }
  };

  const filteredLogs = filterType === "All" 
    ? notifications 
    : notifications.filter((n) => n.type === filterType);

  return (
    <div className="min-h-screen flex flex-col gap-4 text-[#111827] bg-slate-50/50 p-4 select-none max-w-4xl mx-auto w-full">
      <div className="rounded-xl shadow-sm border border-slate-100 bg-white p-4 md:p-6 flex flex-col justify-between min-h-[80vh]">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5 mb-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Activity Logs</span>
              <h1 className="text-2xl font-black tracking-tight">System Events Hub</h1>
            </div>
            
            <button 
              onClick={markAllRead}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 cursor-pointer"
            >
              Clear All Unread Dots{filteredLogs.some((n) => !n.read) ? ` (${filteredLogs.filter((n) => !n.read).length})` : ""}
            </button>
          </div>

          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold w-fit mb-5 overflow-x-auto max-w-full">
            {["All", "Order", "Cart", "Stock", "System", "Marketing", "Chat"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterType === type ? "bg-[#111827] text-white shadow-sm" : "text-slate-500 hover:text-[#111827]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-1">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => {
                // Dynamically resolve colors if not provided from database rows
                const badgeColor = log.badgeColor || "bg-zinc-100 text-zinc-800";
                const logTime = log.createdAt || log.time || new Date();

                return (
                  <div 
                    key={log.id} 
                    className={`p-4 rounded-xl border flex gap-4 items-start transition-all relative ${
                      log.read ? "bg-white border-slate-100" : "bg-orange-50/10 border-orange-100/50 shadow-sm"
                    }`}
                  >
                    {!log.read && (
                      <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                    )}

                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wide rounded-md shrink-0 text-center min-w-[64px] ${badgeColor}`}>
                      {log.type}
                    </span>

                    <div className="space-y-0.5 max-w-[85%]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className={`text-sm tracking-tight ${log.read ? "font-bold text-slate-800" : "font-black text-[#111827]"}`}>
                          {log.title}
                        </h2>
                        <span className="text-[10px] font-medium text-slate-400 shrink-0">
                          · {new Date(logTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 shrink-0">
                          · {new Date(logTime).toLocaleDateString("en-US", { month: "2-digit", year: "2-digit", day: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        {log.description}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">
                No system log notices mapped within this channel branch.
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 mt-6 flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Persisted Logs Tracked: {notifications.length} Entries</span>
          <span className={connectionStatus.startsWith("Live") ? "text-emerald-600 animate-pulse" : "text-amber-600"}>
            Status: {connectionStatus}
          </span>
        </div>
      </div>
    </div>
  );
}

// Loading UI Fallback during static build compile
function LoadingPlaceholder() {
  return (
    <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-3 text-slate-400">
      <FiLoader className="animate-spin text-[#111827]" size={28} />
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
        Syncing Events Hub...
      </p>
    </div>
  );
}

// 🌟 Default entry wrapped in Suspense to prevent build compilation errors
export default function Notifications() {
  return (
    <Suspense fallback={<LoadingPlaceholder />}>
      <NotificationsContent />
    </Suspense>
  );
}