"use client";
import React, { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { BsFillChatFill } from "react-icons/bs";
import { FiLoader } from "react-icons/fi";
import { socket } from "../../lib/socket";
import CustomerTable from "../../components/admin/CustomerTable";
import AdminChat from "../../components/admin/AdminChat";
import FooterInteract from "../../components/admin/FooterInteract";
import CustomerActivity from "../../components/admin/CustomerActivity";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Customers() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // 1. Unified Source of Truth directly from URL Parameter Matrix
  const page = Number(searchParams.get("page")) || 1;
  const urlCustomerId = searchParams.get("customerId") || "";

  const [searchTerm, setSearchTerm] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [messageInput, setMessageInput] = useState("");

  const itemsPerPage = 7;
  const chatEndRef = useRef(null);

  const { data: customers = [], isLoading: customersLoading } = useSWR(
    "/api/customers",
    fetcher,
    {
      refreshInterval: 5000,
    },
  );

  const isCustomerArray = Array.isArray(customers);

  const filteredCustomers = isCustomerArray
    ? customers.filter(
        (c) =>
          c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.status?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomersSlice = filteredCustomers.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const startEntryNumber = totalItems === 0 ? 0 : indexOfFirstItem + 1;
  const endEntryNumber = Math.min(indexOfLastItem, totalItems);

  // Synchronize active profile target strictly with url parameters identifier state
  const selectedCustomer = isCustomerArray
    ? customers.find((c) => String(c.id) === String(urlCustomerId)) || currentCustomersSlice[0]
    : null;

  const {
    data: messages = [],
    mutate: mutateMessages,
    isLoading: messagesLoading,
  } = useSWR(
    selectedCustomer
      ? `/api/messages?customerId=${selectedCustomer.id}&viewer=ADMIN`
      : null,
    fetcher,
  );

  // 2. Pure helper function to generate consistent tracking URL changes
const createQueryString = (name, value) => {
  const params = new URLSearchParams(searchParams.toString());

  if (value) {
    params.set(name, String(value));
  } else {
    params.delete(name);
  }

  // ONLY reset to page 1 if we are changing filters/search, NOT when selecting items!
  const isSelectingItem = name === "orderId" || name === "customerId" || name === "mailId";
  
  if (name !== "page" && !isSelectingItem) {
    params.set("page", "1");
  }

  return params.toString();
};

  const handleUrlParamChange = (name, value) => {
    const queryString = createQueryString(name, value);
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };

  useEffect(() => {
    if (chatOpen && selectedCustomer) {
      socket.emit("mark_read", {
        customerId: selectedCustomer.id,
        viewer: "ADMIN",
      });
      fetch("/api/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          viewer: "ADMIN",
        }),
      }).then(() => mutateMessages());
    }
  }, [chatOpen, selectedCustomer, mutateMessages]);

  useEffect(() => {
    socket.on("messages_read", ({ customerId, viewer }) => {
      if (customerId === selectedCustomer?.id && viewer === "CUSTOMER") {
        mutateMessages();
      }
    });
    return () => socket.off("messages_read");
  }, [selectedCustomer?.id, mutateMessages]);

  // Map unread counts per customerId
  const unreadCountsByCustomer = Array.isArray(messages)
    ? messages.reduce((acc, m) => {
        if (m.sender === "CUSTOMER" && !m.read) {
          acc[m.customerId] = (acc[m.customerId] || 0) + 1;
        }
        return acc;
      }, {})
    : {};

  const adminUnreadCount = selectedCustomer ? unreadCountsByCustomer[selectedCustomer.id] || 0 : 0;

  useEffect(() => {
    socket.connect();
    socket.on("receive_message", (incomingMsg) => {
      if (incomingMsg.customerId === selectedCustomer?.id) {
        mutateMessages(
          (prev) => [...(Array.isArray(prev) ? prev : []), incomingMsg],
          false,
        );
      }
    });
    return () => {
      socket.off("receive_message");
      socket.disconnect();
    };
  }, [selectedCustomer?.id, mutateMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedCustomer) return;

    const payload = {
      customerId: selectedCustomer.id,
      sender: "ADMIN",
      text: messageInput.trim(),
    };

    mutateMessages(
      (prev) => [
        ...(Array.isArray(prev) ? prev : []),
        { ...payload, id: Date.now().toString(), createdAt: new Date() },
      ],
      false,
    );

    setMessageInput("");

    try {
      socket.emit("send_message", payload);
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      mutateMessages();
    } catch (err) {
      console.error("Outbound message routing error", err);
    }
  };

  if (customersLoading) {
    return (
      <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-3 text-slate-400">
        <FiLoader className="animate-spin text-[#111827]" size={28} />
        <p className="text-xs font-bold uppercase tracking-widest">
          Hydrating Customer Directory indices...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-3 gap-4 text-[#111827] bg-slate-50/50 p-6 select-none relative overflow-x-hidden">
      {/* MAIN CUSTOMER DIRECTORY CONTAINER */}
      <div className="col-span-1 lg:col-span-2 rounded-xl shadow-sm border border-slate-100 bg-white p-4 md:p-6 flex flex-col justify-between h-full">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Database
              </span>
              <h1 className="text-2xl font-black tracking-tight">
                Customer Directory
              </h1>
            </div>

            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleUrlParamChange("page", 1);
              }}
              className="w-full sm:w-64 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#111827] text-slate-700 bg-slate-50/50"
            />
          </div>

          <div className="hidden md:block overflow-y-auto max-h-[68vh]">
            <CustomerTable
              setSelectedCustomerId={(id) => handleUrlParamChange("customerId", id)}
              setChatOpen={setChatOpen}
              selectedCustomer={selectedCustomer}
              currentCustomersSlice={currentCustomersSlice}
            />
          </div>
        </div>
        <FooterInteract
          startEntryNumber={startEntryNumber}
          endEntryNumber={endEntryNumber}
          setCurrentPage={(pageNumber) => handleUrlParamChange("page", pageNumber)}
          createQueryString={createQueryString}
          page={page}
          router={router}
          pathname={pathname}
          totalItems={totalItems}
          totalPages={totalPages}
        />
      </div>

      {/* SIDEBAR VIEW: PROFILE SNAPSHOT */}
      <div className="rounded-xl shadow-sm border border-slate-100 bg-white p-5 md:p-6 flex flex-col justify-between h-full border-t-4 border-t-[#111827] relative min-h-[500px]">
        {selectedCustomer ? (
          <div className="flex flex-col justify-between h-full space-y-6">
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-orange-600 font-mono break-all block max-w-[150px] truncate">
                    {selectedCustomer.id}
                  </span>
                  <h2 className="text-xl font-black text-[#111827] mt-0.5">
                    {selectedCustomer.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedCustomer.email}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setChatOpen(!chatOpen)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer relative z-10 ${
                    chatOpen
                      ? "bg-[#111827] text-white border-[#111827]"
                      : "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100"
                  }`}
                >
                  <BsFillChatFill size={16} />

                  {!chatOpen && adminUnreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center animate-bounce z-50 shadow-sm pointer-events-none">
                      {adminUnreadCount}
                    </span>
                  )}
                </button>
              </div>

              {chatOpen ? (
                <AdminChat
                  setChatOpen={setChatOpen}
                  messagesLoading={messagesLoading}
                  handleSendMessage={handleSendMessage}
                  messageInput={messageInput}
                  setMessageInput={setMessageInput}
                  messages={messages}
                  chatEndRef={chatEndRef}
                />
              ) : (
                <CustomerActivity selectedCustomer={selectedCustomer} />
              )}
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                className="w-full py-2 bg-[#111827] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Issue Direct Discount / Token
              </button>
              <button
                type="button"
                className="w-full py-2 border border-slate-200 hover:border-orange-500 rounded-lg text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors cursor-pointer"
              >
                Flag Session / Review Logs
              </button>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 text-xs py-8 text-center">
            Select an account profile from the file index directory to audit operational details.
          </div>
        )}
      </div>
    </div>
  );
}