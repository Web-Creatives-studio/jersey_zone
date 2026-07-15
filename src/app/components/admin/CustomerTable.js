"use client";

import React from "react";

export default function CustomerTable({
  setSelectedCustomerId,
  setChatOpen,
  selectedCustomer,
  currentCustomersSlice,
}) {
  return (
    <div>
      <table className="w-full text-left border-collapse text-xs md:text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-slate-400 font-semibold tracking-wider uppercase text-[11px]">
            <th className="pb-3">Customer</th>
            <th className="pb-3">Date Joined</th>
            <th className="pb-3">Segment</th>
            <th className="pb-3 text-center">Orders</th>
            <th className="pb-3 text-right">Total Spend</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {currentCustomersSlice.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="p-8 text-center text-slate-400 font-medium"
              >
                No records match this filter.
              </td>
            </tr>
          ) : (
            currentCustomersSlice.map((customer) => (
              <tr
                key={customer.id}
                onClick={() => {
                  setSelectedCustomerId(customer.id);
                  setChatOpen(false); // Close active chat view snapshot window on switch
                }}
                className={`cursor-pointer transition-colors ${
                  String(selectedCustomer?.id) === String(customer.id)
                    ? "bg-orange-50/40"
                    : "hover:bg-slate-50"
                }`}
              >
                <td className="py-4 font-medium text-slate-700">
                  <div className="font-bold text-[#111827]">
                    {customer.name}
                  </div>
                  <div className="text-xs text-slate-400 font-normal">
                    {customer.email}
                  </div>
                </td>
                <td className="py-4 text-slate-500">
                  {customer.createdAt 
                    ? new Date(customer.createdAt).toLocaleDateString() 
                    : customer.joinedDate || "N/A"}
                </td>
                <td className="py-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                      customer.status === "VIP"
                        ? "bg-orange-100 text-orange-700"
                        : customer.status === "Inactive"
                          ? "bg-slate-100 text-slate-400"
                          : "bg-blue-50 text-[#111827]"
                    }`}
                  >
                    {customer.status || "Regular"}
                  </span>
                </td>
                <td className="py-4 text-center font-semibold text-slate-600">
                  {customer.totalOrders || 0}
                </td>
                <td className="py-4 text-right font-black text-[#111827]">
                  {typeof customer.totalSpent === "number"
                    ? `$${customer.totalSpent.toFixed(2)}`
                    : customer.totalSpent || "$0.00"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}