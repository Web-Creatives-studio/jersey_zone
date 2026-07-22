"use client";

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
  itemPage = 1,
  itemsPerPageSide = 2,
  setItemPage,
  updating,
  handleFulfillmentUpdate,
}) {
  if (!selectedOrder) return null;

  // 1. Safe JSON Parser Helper for Items
  const getParsedItems = (items) => {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    if (typeof items === "string") {
      try {
        const parsed = JSON.parse(items);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Failed to parse items string:", e);
        return [];
      }
    }
    return [];
  };

  // 2. Safe JSON Parser Helper for Shipping Address
  const getParsedAddress = (address) => {
    if (!address) return {};
    if (typeof address === "object") return address;
    if (typeof address === "string") {
      try {
        return JSON.parse(address);
      } catch (e) {
        return { street: address };
      }
    }
    return {};
  };

  const parsedItems = getParsedItems(selectedOrder.items);
  const parsedAddress = getParsedAddress(selectedOrder.shippingAddress);

  // Pagination calculation
  const totalItemsCount = parsedItems.length;
  const totalPages = Math.ceil(totalItemsCount / itemsPerPageSide) || 1;
  const currentItemsSlice = parsedItems.slice(
    (itemPage - 1) * itemsPerPageSide,
    itemPage * itemsPerPageSide
  );

  // Date Formatting Helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime())
      ? "N/A"
      : parsed.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime())
      ? ""
      : parsed.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Order Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase text-orange-600">
              {selectedOrder.id || "ORDER"}
            </span>
            <h2 className="text-lg font-bold text-[#111827]">
              {selectedOrder.customerName || "Customer"}
            </h2>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>Placed on</p>
            <div className="flex gap-2 justify-end">
              <p className="font-bold text-slate-600">
                {formatDate(selectedOrder.date || selectedOrder.createdAt)}
              </p>
              <p className="font-bold text-slate-600">
                {formatTime(selectedOrder.createdAt || selectedOrder.date)}
              </p>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Order Items ({totalItemsCount})
            </h3>

            {/* Pagination Controls */}
            {totalItemsCount > itemsPerPageSide && (
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                <span>
                  {itemPage} / {totalPages}
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
                    disabled={itemPage >= totalPages}
                    onClick={() => setItemPage((p) => Math.min(p + 1, totalPages))}
                    className="p-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    <FiChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Items Container */}
          <div className="space-y-2 min-h-20">
            {totalItemsCount === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No items present in this order.
              </p>
            ) : (
              currentItemsSlice.map((item, index) => {
                const itemImage = item.image || item.images || "/placeholder.jpeg";
                const color = item.selected_color || item.selectedColor || "Standard";
                const size = item.selected_size || item.selectedSize || "M";
                const price = Number(item.price || 0).toFixed(2);

                return (
                  <div
                    key={item.id || index}
                    className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100 gap-2 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center p-0.5">
                      <img
                        src={itemImage}
                        alt={item.name || "Order item"}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.jpeg";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 px-1">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {item.name || "Jersey Kit"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        Variant:{" "}
                        <span className="uppercase font-semibold">
                          {color} / {size}
                        </span>
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-slate-700">
                        Qty: {item.quantity || 1}
                      </p>
                      <p className="text-xs font-semibold text-orange-600">
                        ${price}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Shipping Information
          </h3>
          <div className="text-sm text-slate-600 bg-slate-50/50 p-3 rounded-lg border border-dashed border-slate-200 space-y-0.5">
            <p className="font-bold text-[#111827]">
              {selectedOrder.customerName || "Customer"}
            </p>
            <p>{parsedAddress.street || parsedAddress.address || "No street address provided"}</p>
            <p>
              {parsedAddress.city || ""}{parsedAddress.city && parsedAddress.zip ? ", " : ""}{parsedAddress.zip || parsedAddress.zipCode || ""}
            </p>
            <p className="font-semibold text-xs tracking-wider uppercase mt-1 text-slate-400">
              {parsedAddress.country || "Standard Shipping"}
            </p>
          </div>
        </div>

        {/* Order Financial Breakdowns */}
        <div className="space-y-1.5 text-sm pt-2">
          <div className="flex justify-between text-slate-500">
            <span>Discount</span>
            <span className="font-medium text-red-600">
              -${Number(selectedOrder.discount || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="font-medium">
              ${Number(selectedOrder.subtotal || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Shipping & Fees</span>
            <span className="font-medium">
              ${Number(selectedOrder.shipping || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between font-black text-base text-[#111827] pt-2 border-t border-slate-100">
            <span>Grand Total</span>
            <span className="text-orange-600">
              ${Number(selectedOrder.totalAmount || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-4 mt-2 border-t border-slate-100">
        <button
          onClick={() => window.print()}
          type="button"
          className="py-2.5 border border-slate-200 hover:border-[#111827] rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-zinc-800"
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
                : selectedOrder.status === "Delivered"
                ? "Fulfilled"
                : "Mark as Shipped"}
            </>
          )}
        </button>
      </div>
    </>
  );
}