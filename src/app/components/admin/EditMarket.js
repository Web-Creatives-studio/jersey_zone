"use client";
import React, { useState } from "react";
import CreateMarket from "../../components/admin/CreateMarket";

export default function ShowMail({ selectedMail }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex flex-col h-full justify-between space-y-6">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">{selectedMail.name}</h2>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-0.5 font-semibold">
              Category: {selectedMail.category}
            </p>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              selectedMail.isActive ? "bg-green-50 text-green-700 border border-green-200" : "bg-neutral-50 text-neutral-400"
            }`}
          >
            {selectedMail.isActive ? "● Active" : "● Paused"}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight block">Outbound Subject Line</span>
            <p className="text-sm font-medium text-slate-800 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {selectedMail.subject}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight block mb-1">HTML Template Snapshot</span>
            <div className="border border-slate-200 rounded-lg bg-slate-900 p-4 max-h-[250px] overflow-y-auto font-mono text-xs text-orange-400">
              <pre className="whitespace-pre-wrap">{selectedMail.htmlContent}</pre>
            </div>
          </div>

          {selectedMail.images?.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight block mb-1">Attached Banner Assets</span>
              <div className="flex gap-2 overflow-x-auto py-1">
                {selectedMail.images.map((img, i) => (
                  <img key={i} src={img} alt="Asset Source" className="h-14 w-24 object-cover rounded-md border border-slate-200 shadow-sm" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 space-y-3">
        <button
          onClick={() => setIsEditing(true)}
          className="w-full py-2.5 bg-zinc-900 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition dynamic-shadow"
        >
          Modify & Edit Pipeline Template
        </button>
      </div>

      {/* Render the modal overlay if editing state is engaged */}
      {isEditing && (
        <CreateMarket 
          setCreateMarket={setIsEditing} 
          editingAutomation={selectedMail} 
        />
      )}
    </div>
  );
}