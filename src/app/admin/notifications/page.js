"use client";
import React, { useState, useEffect } from "react";

export default function Notifications() {
  const [filterType, setFilterType] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("Syncing logs...");

  useEffect(() => {
    // 1. Fetch historical notification records on component mount
    fetch("/api/notifications/history")
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) setNotifications(data.logs);
        setConnectionStatus("Live");
      })
      .catch(() => setConnectionStatus("Offline Feed Mode"));

    // 2. Attach the persistent real-time streaming listener
    const eventSource = new EventSource("/api/notifications");

    eventSource.onmessage = (event) => {
      try {
        const incomingLog = JSON.parse(event.data);
        // Prepend new notifications directly to the top of the UI
        setNotifications((prev) => [incomingLog, ...prev]);
      } catch (err) {
        console.error("Error reading notification buffer stream:", err);
      }
    };

    return () => eventSource.close();
  }, []);

const markAllRead = async () => {
  // 1. Optimistically update local state for real-time responsiveness
  setNotifications(notifications.map(n => ({ ...n, read: true })));

  try {
    // 2. Perform background database synchronization
    const response = await fetch("/api/notifications/read", {
      method: "PUT",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) throw new Error("Database mutation failed");
  } catch (error) {
    console.error("Failed to sync read notifications to cloud:", error);
    // Optional: Revert local state or alert user if connection failed completely
  }
};

  const filteredLogs = filterType === "All" 
    ? notifications 
    : notifications.filter(n => n.type === filterType);

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
              className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100"
            >
              Clear All Unread Dots{filteredLogs.some(n => !n.read) ? ` (${filteredLogs.filter(n => !n.read).length})` : ""}
            </button>
          </div>

          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold w-fit mb-5 overflow-x-auto max-w-full">
            {["All", "Order", "Cart", "Stock", "System","Marketing","Chat"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  filterType === type ? "bg-[#111827] text-white shadow-sm" : "text-slate-500 hover:text-[#111827]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-1">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className={`p-4 rounded-xl border flex gap-4 items-start transition-all relative ${
                    log.read ? "bg-white border-slate-100" : "bg-orange-50/10 border-orange-100/50 shadow-sm"
                  }`}
                >
                  {!log.read && (
                    <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                  )}

                  <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wide rounded-md shrink-0 text-center min-w-[64px] ${log.badgeColor}`}>
                    {log.type}
                  </span>

                  <div className="space-y-0.5 max-w-[85%]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className={`text-sm tracking-tight ${log.read ? "font-bold text-slate-800" : "font-black text-[#111827]"}`}>
                        {log.title}
                      </h2>
                      <span className="text-[10px] font-medium text-slate-400 shrink-0">
                        · {new Date(log.createdAt || log.time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 shrink-0">
                        · {new Date(log.createdAt || log.time).toLocaleDateString("en-US", { month: "2-digit", year: "2-digit", day:"2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {log.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">
                No system log notices mapped within this channel branch.
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 mt-6 flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Persisted Logs Tracked: {notifications.length} Entries</span>
          <span className={connectionStatus === "Live" ? "text-emerald-600" : "text-amber-600"}>
            Status: {connectionStatus}
          </span>
        </div>
      </div>
    </div>
  );
}