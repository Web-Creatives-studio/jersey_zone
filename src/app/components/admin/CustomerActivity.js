import React from "react";

export default function CustomerActivity({ selectedCustomer }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">
            Total Volume
          </span>
          <span className="text-lg font-black text-[#111827]">
            {selectedCustomer.totalSpent}
          </span>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">
            Completed Orders
          </span>
          <span className="text-lg font-black text-orange-600">
            {selectedCustomer.totalOrders}
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Most Recent Engagement
        </h3>
        <div className="text-xs text-slate-600 bg-slate-50/50 p-3 rounded-lg border border-dashed border-slate-200">
          <p className="font-medium text-slate-700">
            {selectedCustomer.recentPurchase}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            System Profile Verified: {selectedCustomer.joinedDate}
          </p>
        </div>
      </div>
    </div>
  );
}
