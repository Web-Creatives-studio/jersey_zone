import React from "react";
import {
  FiPrinter,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
    FiLoader,
} from "react-icons/fi";

export default function ShowOrder({
  selectedOrder,
  itemPage,
  itemsPerPageSide,
  setItemPage,
  updating,
   handleFulfillmentUpdate
}) {
  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase text-orange-600">
              {selectedOrder.id}
            </span>
            <h2 className="text-lg font-bold text-[#111827]">
              {selectedOrder.customerName}
            </h2>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>Placed on</p>
            <div className="flex gap-2">
              <p className="font-bold text-slate-600">
                {new Date(selectedOrder.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p className="font-bold text-slate-600">
                {new Date(selectedOrder.createdAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Order Items
            </h3>

            {/* MINI LINE ITEM PAGINATION CONTROLS */}
            {selectedOrder.items?.length > itemsPerPageSide && (
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                <span>
                  {itemPage}/
                  {Math.ceil(selectedOrder.items.length / itemsPerPageSide)}
                </span>
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    disabled={itemPage === 1}
                    onClick={() => setItemPage((p) => Math.max(p - 1, 1))}
                    className="p-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft size={12} />
                  </button>
                  <button
                    type="button"
                    disabled={
                      itemPage >=
                      Math.ceil(selectedOrder.items.length / itemsPerPageSide)
                    }
                    onClick={() => setItemPage((p) => p + 1)}
                    className="p-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    <FiChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RENDER SLICED ARRAYS */}
          <div className="space-y-2 min-h-20">
            {Array.isArray(selectedOrder.items) &&
            selectedOrder.items.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No items present in this order.
              </p>
            ) : (
              selectedOrder.items
                .slice(
                  (itemPage - 1) * itemsPerPageSide,
                  itemPage * itemsPerPageSide,
                )
                .map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100 gap-2 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex flex-shrink-0">
                      <img
                        src={item.image || "/products/default.png"}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                      />
                    </div>
                    <div className="flex-1 min-w-0 px-1">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        Variant:{" "}
                        <span className="uppercase font-semibold">
                          {item.selected_color || "default"} /{" "}
                          {item.selected_size || "M"}
                        </span>
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-slate-700">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-xs font-semibold text-orange-600">
                        ${Number(item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Shipping Information
          </h3>
          <div className="text-sm text-slate-600 bg-slate-50/50 p-3 rounded-lg border border-dashed border-slate-200">
            <p className="font-bold text-[#111827]">
              {selectedOrder.customerName}
            </p>
            <p>{selectedOrder.shippingAddress?.street}</p>
            <p>
              {selectedOrder.shippingAddress?.city},{" "}
              {selectedOrder.shippingAddress?.zip}
            </p>
            <p className="font-semibold text-xs tracking-wider uppercase mt-1 text-slate-400">
              {selectedOrder.shippingAddress?.country}
            </p>
          </div>
        </div>

        {/* Order financial breakdowns */}
        <div className="space-y-1.5 text-sm pt-2">
          <div className="flex justify-between text-slate-500">
            <span>Discount</span>
            <span className="font-medium text-red-600">
              -${Number(selectedOrder.discount).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="font-medium">
              ${Number(selectedOrder.subtotal).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Shipping & Fees</span>
            <span className="font-medium">
              ${Number(selectedOrder.shipping).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between font-black text-base text-[#111827] pt-2 border-t border-slate-100">
            <span>Grand Total</span>
            <span className="text-orange-600">
              ${Number(selectedOrder.totalAmount).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 pt-4 mt-2 border-t border-slate-100">
        <button
          onClick={() => window.print()}
          type="button"
          className="py-2.5 border border-slate-200 hover:border-[#111827] rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <FiPrinter size={14} /> Print Invoice
        </button>
        <button
          type="button"
          disabled={
            updating ||
            selectedOrder.status === "Delivered" ||
            selectedOrder.status === "Cancelled"
          }
          onClick={() =>
            handleFulfillmentUpdate(selectedOrder.id, selectedOrder.status)
          }
          className="py-2.5 bg-[#111827] hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          {updating ? (
            <FiLoader className="animate-spin" />
          ) : (
            <>
              <FiCheckCircle size={14} />
              {selectedOrder.status === "Shipped"
                ? "Mark as Delivered"
                : "Mark as Shipped"}
            </>
          )}
        </button>
      </div>
    </>
  );
}
