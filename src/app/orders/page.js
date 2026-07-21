"use client";

import React, { useState, useMemo, Suspense } from "react";
import useSWR from "swr";
import {
  FiBox,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiLoader,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import OrdersCard from "../components/frontend/OrdersCard";
import { useAuth } from "../contexts/AuthContext";

// Force request-time serverless route compilation
export const dynamic = "force-dynamic";

const fetcher = (url) => fetch(url).then((res) => res.json());

function BuyerOrdersContent() {
  // 1. Destructure user and loading context values straight from your secure global state
  const { user, loading: authLoading } = useAuth();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const itemsPerPage = 8;

  // 2. Direct ApiUrl construction based on whether the secure cookie session is hydrated
  const apiUrl = !authLoading && user?.id 
    ? `/api/orders?userId=${user.id}` 
    : null;

  // 3. SWR processes data background syncs directly using the url string state criteria
  const {
    data: orders = [],
    error,
    isLoading: dataLoading,
  } = useSWR(apiUrl, fetcher, {
    refreshInterval: 5000, // Background updates every 5 seconds
    revalidateOnFocus: true,
  });

  const filteredOrders = useMemo(() => {
    return statusFilter === "All"
      ? orders
      : orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  // PAGINATION ARITHMETIC COMPUTATIONS
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrdersSlice = useMemo(() => {
    return filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredOrders, indexOfFirstItem, indexOfLastItem]);

  const startEntryNumber = totalItems === 0 ? 0 : indexOfFirstItem + 1;
  const endEntryNumber = Math.min(indexOfLastItem, totalItems);

  const handleFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1); // Reset page counter back to 1 on filter changes
  };

  // Show secure loader while checking session or pulling background transactions
  if (authLoading || (dataLoading && !orders.length)) {
    return <OrderLoadingPlaceholder />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-zinc-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION WITH FILTER TABS */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold uppercase tracking-tight text-zinc-900">History of Orders</h1>

          {/* Custom Tab Filters */}
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg text-xs font-bold w-full sm:w-auto overflow-x-auto whitespace-nowrap">
            {["All", "Pending", "Shipped", "Delivered", "Cancelled"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => handleFilterChange(status)}
                className={`px-3 py-1.5 rounded-md transition-all flex-1 sm:flex-initial text-center cursor-pointer ${
                  statusFilter === status
                    ? "bg-[#111827] text-white shadow-sm"
                    : "text-slate-500 hover:text-[#111827]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* COMPONENT BODY CONDITIONAL RENDER */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <FiBox className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-bold">No Records Manifested</h3>
            <p className="text-sm text-gray-400 mt-1">
              There are no matching logged transactions found inside this account.
            </p>
          </div>
        ) : (
          <div>
            {currentOrdersSlice.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
                <p className="text-sm text-gray-500 font-medium">No records matching status filter "{statusFilter}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentOrdersSlice.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col justify-between bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-all gap-5"
                  >
                    {/* CARD TOP BAR */}
                    <div className="flex flex-col gap-2 border-b border-gray-100 pb-4">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tracking Identifier</p>
                          <p className="text-xs font-bold text-orange-600 font-mono break-all">{order.id}</p>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                            order.status === "Delivered"
                              ? "bg-emerald-50 text-emerald-700"
                              : order.status === "Shipped"
                                ? "bg-blue-50 text-blue-700"
                                : order.status === "Cancelled"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {order.status === "Delivered" && <FiCheckCircle size={10} />}
                          {order.status === "Shipped" && <FiTruck size={10} />}
                          {order.status === "Pending" && <FiClock size={10} />}
                          {order.status}
                        </span>
                      </div>

                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Date Placed</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-gray-700">
                            {new Date(order.date || order.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-xs font-medium text-gray-400">
                            {new Date(order.createdAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ITEMS LIST AREA */}
                    <div className="flex-1 space-y-3">
                      <OrdersCard order={order} />
                    </div>

                    {/* FINANCIAL CALCULATIONS BREAKDOWN */}
                    <div className="space-y-1.5 text-sm pt-2 border-t border-gray-50">
                      <div className="flex justify-between text-slate-500">
                        <span>Discount</span>
                        <span className="font-medium text-red-600">-${Number(order.discount || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Subtotal</span>
                        <span className="font-medium text-zinc-800">${Number(order.subtotal || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Shipping & Fees</span>
                        <span className="font-medium text-zinc-800">${Number(order.shipping || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex justify-between items-center mt-auto">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Paid</p>
                      <p className="text-lg font-black text-gray-900">${Number(order.totalAmount || 0).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PAGINATION INTERACTION CONTROLS */}
            <div className="flex justify-between items-center mt-6 p-4">
              <span className="text-sm text-zinc-600">
                Showing <b>{startEntryNumber}-{endEntryNumber}</b> of <b>{totalItems}</b> entries
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-100 transition cursor-pointer disabled:cursor-not-allowed text-zinc-600"
                >
                  <FiChevronLeft size={14} />
                </button>

                <div className="px-3 py-1 font-bold text-slate-700 bg-slate-50 rounded-md border border-slate-100 text-xs">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-100 transition cursor-pointer disabled:cursor-not-allowed text-zinc-600"
                >
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Extracted Loading Placeholder View
function OrderLoadingPlaceholder() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-2 text-gray-500">
      <FiLoader className="animate-spin text-orange-500" size={28} />
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
        Loading Order Records...
      </p>
    </div>
  );
}

// Default export wrapped within a Suspense layout boundary to support successful deployments
export default function BuyerOrdersPage() {
  return (
    <Suspense fallback={<OrderLoadingPlaceholder />}>
      <BuyerOrdersContent />
    </Suspense>
  );
}