import React from "react";
import { FiSend, FiX, FiLoader } from "react-icons/fi";
export default function AdminChat({
  setChatOpen,
  messagesLoading,
  handleSendMessage,
  messageInput,
  setMessageInput,
  messages,
  chatEndRef,
}) {
  return (
    <div>
      <div className="border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col h-[380px] justify-between overflow-hidden">
        <div className="bg-slate-100 p-2.5 text-xs font-bold flex justify-between items-center border-b border-slate-200">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
            Channel Live Connection
          </span>
          <button
            type="button"
            onClick={() => setChatOpen(false)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <FiX size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
          {messagesLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-1">
              <FiLoader className="animate-spin text-orange-500" />
              <span>Syncing chat...</span>
            </div>
          ) : !Array.isArray(messages) || messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 italic text-center p-4">
              No previous dialogue recorded. Outbound vectors open.
            </div>
          ) : (
            messages.map((msg, i) => {
              const isAdmin = msg.sender === "ADMIN";
              return (
                <div
                  key={msg.id || i}
                  className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-2.5 leading-tight font-medium ${
                      isAdmin
                        ? "bg-[#111827] text-white rounded-br-none"
                        : "bg-slate-200 text-slate-800 rounded-bl-none"
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
          className="p-2 bg-white border-t border-slate-100 flex gap-1.5 items-center shrink-0"
        >
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type secure response..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-medium focus:outline-none focus:border-[#111827] text-slate-800"
          />
          <button
            type="submit"
            className="p-2 bg-orange-500 hover:bg-orange-600 transition text-white rounded-lg cursor-pointer shrink-0"
          >
            <FiSend size={12} />
          </button>
        </form>
      </div>
    </div>
  );
}
