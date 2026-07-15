import React from "react";
import { FiRefreshCw, FiChevronLeft, FiChevronRight } from "react-icons/fi";


export default function FooterInteract({
  startEntryNumber,
  endEntryNumber,
  totalItems,
  totalPages,
  page,
  createQueryString,
  router,
  pathname,
}) {


  return (
    <div>
      {/* SYSTEM INTERACTIVE PAGINATION COMPONENT FOOTER ACTION ROW BAR */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-between items-center text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-4">
          <span>
            Showing{" "}
            <b>
              {startEntryNumber}-{endEntryNumber}
            </b>{" "}
            of <b>{totalItems}</b> entries
          </span>
          <span className="hidden sm:flex items-center gap-1 text-emerald-600 font-bold">
            <FiRefreshCw
              className="animate-spin text-emerald-500"
              size={10}
              style={{ animationDuration: "3s" }}
            />{" "}
            Live DB Connected
          </span>
        </div>

        {/* Navigation Button Block Group Elements */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => {
              const prevPage = page - 1;
              router.push(`${pathname}?${createQueryString("page", prevPage)}`);
            }}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-100 transition cursor-pointer disabled:cursor-not-allowed"
          >
            <FiChevronLeft size={14} />
          </button>

          <div className="px-3 py-1 font-bold text-slate-700 bg-slate-50 rounded-md border border-slate-100">
            Page {page} of {totalPages}
          </div>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => {
              const nextPage = page + 1;
              router.push(`${pathname}?${createQueryString("page", nextPage)}`);
            }}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-100 transition cursor-pointer disabled:cursor-not-allowed"
          >
            <FiChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
