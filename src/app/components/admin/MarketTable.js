"use client";

import React from "react";

export default function MarketTable({ currentMailSlice, setSelectedMailId, selectedMail }) {
  return (
    <div className="w-full">
      <table className="w-full text-left border-collapse text-xs md:text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-slate-400 font-semibold tracking-wider uppercase text-[11px]">
            <th className="pb-3">Flow Name</th>
            <th className="pb-3">System Category Target</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Trigger Method</th>
            <th className="pb-3 text-right">Timing Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {currentMailSlice.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                No pipeline rules found.
              </td>
            </tr>
          ) : (
            currentMailSlice.map((mail) => (
              <tr
                key={mail.id}
                onClick={() => setSelectedMailId(mail.id)}
                className={`cursor-pointer transition-colors ${
                  String(selectedMail?.id) === String(mail.id) 
                    ? "bg-orange-50/40" 
                    : "hover:bg-slate-50"
                }`}
              >
                <td className="p-4 font-bold text-zinc-900">{mail.name}</td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 tracking-wide uppercase">
                    {mail.category}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                      mail.isActive
                        ? "bg-orange-100 text-orange-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {mail.isActive ? "Active" : "Paused"}
                  </span>
                </td>
                <td className="p-4 font-semibold text-slate-600 uppercase text-[11px]">
                  {mail.triggerType || "INSTANT"}
                </td>
                <td className="p-4 font-medium text-slate-500 text-right">
                  {mail.triggerType === "DELAYED"
                    ? `+ ${mail.delayInHours || 0} Hours`
                    : mail.triggerType === "SCHEDULED" && mail.scheduledFor
                    ? new Date(mail.scheduledFor).toLocaleDateString()
                    : "Instant Reaction"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}