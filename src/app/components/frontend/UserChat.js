// app/components/frontend/UserChat.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { BsFillChatFill } from "react-icons/bs";
import { FiSend, FiX, FiLoader, FiMinus } from "react-icons/fi";
import { socket } from "../../lib/socket"; 
import { useAuth } from "../../contexts/AuthContext"; 

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function UserChat() {
  const { user, loading: authLoading } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const [customerName, setCustomerName] = useState("Guest Buyer"); 
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (authLoading) return;

    if (user?.id) {
      setCustomerId(user.id);
      setCustomerName(user.name || user.email || "Authenticated Client"); 
    } else {
      try {
        let guestId = localStorage.getItem("guestChatId");
        if (!guestId) {
          guestId = `GUEST-${Math.floor(100000 + Math.random() * 900000)}`;
          localStorage.setItem("guestChatId", guestId);
        }
        setCustomerId(guestId);
        setCustomerName("Guest Buyer"); 
      } catch (e) {
        console.error("Guest profile storage tracking block failure:", e);
      }
    }
  }, [user, authLoading]);

  const {
    data: messages = [],
    mutate: mutateMessages,
    isLoading: dataLoading,
  } = useSWR(
    customerId && isOpen
      ? `/api/messages?customerId=${customerId}&viewer=CUSTOMER`
      : null,
    fetcher,
  );

  const customerUnreadCount = Array.isArray(messages)
    ? messages.filter((m) => m.sender === "ADMIN" && !m.read).length
    : 0;

  useEffect(() => {
    if (isOpen && !isMinimized && customerId) {
      socket.emit("mark_read", { customerId, viewer: "CUSTOMER" });
      fetch("/api/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, viewer: "CUSTOMER" }),
      }).then(() => mutateMessages());
    }
  }, [isOpen, isMinimized, customerId, mutateMessages]);

  useEffect(() => {
    if (!customerId) return;

    socket.connect();

    // 🌟 FIXED: Dropped duplicated local array appends from client side socket echos
    socket.on("receive_message", (incomingMsg) => {
      if (incomingMsg.customerId === customerId && incomingMsg.sender === "ADMIN") {
        mutateMessages(
          (prev) => [...(Array.isArray(prev) ? prev : []), incomingMsg],
          false,
        );
      }
    });

    socket.on("messages_read", ({ customerId: id, viewer }) => {
      if (id === customerId && viewer === "ADMIN") {
        mutateMessages();
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("messages_read");
      socket.disconnect();
    };
  }, [customerId, mutateMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isMinimized]);
const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!messageInput.trim() || !customerId) return;

  const currentText = messageInput.trim();
  setMessageInput(""); // Clear field instantly for a professional snappy response

  const temporaryPayload = {
    id: `TEMP-${Date.now()}`, // Temporary tracking id string
    customerId,
    customerName, 
    sender: "CUSTOMER",
    text: currentText,
    createdAt: new Date(),
    read: false
  };

  // 🌟 THE ULTIMATE frontend FIX: Update UI instantly, but roll over SWR cache revalidation *after* the API finishes
  mutateMessages(
    (prev) => [...(Array.isArray(prev) ? prev : []), temporaryPayload],
    false // 👈 Crucial: Tell SWR NOT to trigger a network fetch revalidation immediately!
  );

  try {
    // 1. Fire WebSockets broadcast out immediately to the admin panel
    socket.emit("send_message", {
      customerId,
      customerName,
      sender: "CUSTOMER",
      text: currentText,
    });

    // 2. Commit record line directly down to your database
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        customerName,
        sender: "CUSTOMER",
        text: currentText,
      }),
    });

    if (res.ok) {
      // 🌟 Overwrite your temporary placeholder message item with the true database record cleanly
      mutateMessages(); 
    }
  } catch (err) {
    console.error("Outbound communication failed:", err);
  }
};

  if (authLoading || !customerId) return null;

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 sm:p-6 flex flex-col items-end pointer-events-none w-full max-w-md text-zinc-900">
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="pointer-events-auto bg-orange-500 hover:bg-orange-600 active:scale-95 text-white p-4 rounded-full shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center cursor-pointer gap-2 border-0 outline-none"
        >
          <BsFillChatFill size={20} />
          <span className="text-xs font-bold tracking-wide pr-1">Chat Support</span>

          {customerUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black h-5 w-5 rounded-full border-2 border-white flex items-center justify-center shadow-md animate-pulse">
              {customerUnreadCount}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div
          className={`pointer-events-auto bg-white border border-slate-200 shadow-2xl transition-all duration-300 ease-in-out w-full
            ${
              isMinimized
                ? "h-12 rounded-t-xl overflow-hidden"
                : "h-[85vh] sm:h-[400px] rounded-t-2xl sm:rounded-2xl flex flex-col justify-between"
            } 
            fixed bottom-0 right-0 sm:absolute sm:bottom-6 sm:right-6 overflow-hidden`}
        >
          <div className="bg-[#111827] text-white p-3.5 flex justify-between items-center select-none shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-tight">Support Concierge</span>
            </div>

            <div className="flex items-center gap-3 text-slate-400">
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:text-white transition cursor-pointer hidden sm:block bg-transparent border-0 outline-none"
              >
                <FiMinus size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="hover:text-white transition cursor-pointer bg-transparent border-0 outline-none"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60 text-xs">
                {dataLoading && !messages.length ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-1.5">
                    <FiLoader className="animate-spin text-orange-500" size={18} />
                    <span>Opening secure channel...</span>
                  </div>
                ) : !Array.isArray(messages) || messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-6 py-8">
                    <p className="font-bold text-slate-700 text-sm mb-1">Hello, {customerName}! 👋</p>
                    <p className="leading-relaxed">
                      How can we help you today? Send a message to connect directly with our administration team.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isCustomer = msg.sender === "CUSTOMER";
                    return (
                      <div
                        key={msg.id || i}
                        className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-xl px-3.5 py-2.5 font-medium leading-relaxed shadow-sm ${
                            isCustomer
                              ? "bg-orange-500 text-white rounded-br-none"
                              : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center shrink-0"
              >
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#111827] text-slate-800"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition cursor-pointer flex-shrink-0 border-0 outline-none"
                >
                  <FiSend size={14} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}