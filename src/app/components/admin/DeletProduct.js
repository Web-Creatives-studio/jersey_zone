"use client";

import { FaTrash } from "react-icons/fa";

export default function DeleteProduct({
  closeDeleteModal,
  productToDelete,
  selectedRows,
  isDeleting,
  handleExecuteDelete,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blur Overlay Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
        onClick={closeDeleteModal}
      />

      {/* Modal Container Card */}
      <div className="relative bg-white border border-zinc-200 rounded-2xl w-full max-w-md p-6 shadow-2xl overflow-hidden scale-in-center animate-in fade-in duration-150">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            <FaTrash className="text-red-500 w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-zinc-900 tracking-tight">
              {productToDelete === "bulk"
                ? "Bulk Delete Products"
                : "Confirm Product Deletion"}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
              Are you sure you want to remove the    {productToDelete.name} parameters?
              This row state adjustment changes active client inventory records
              instantly.
            </p>

            {/* Target Information Display Box */}
            <div className="mt-4 bg-zinc-50 border border-zinc-100 rounded-xl p-3">
              {productToDelete === "bulk" ? (
                <p className="text-xs font-bold text-zinc-700">
                  Purging{" "}
                  <span className="text-red-600 font-black">
                    {selectedRows.length}
                  </span>{" "}
                  selected batch rows.
                </p>
              ) : (
                <>
                  <p className="text-xs font-bold text-zinc-800 truncate">
                    {productToDelete.name}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                    ID Reference: {productToDelete.id}
                  </p>
                </>
              )}
            </div>

            {/* Confirm Option Selection Footer Actions Toggle Layout */}
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-800 bg-zinc-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
