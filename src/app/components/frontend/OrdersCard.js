"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function OrdersCard({ order }) {
  const [itemPage, setItemPage] = useState(1);
  const itemsPerPageSide = 1;

  // 1. Safely normalize order.items (handles JSON strings or array values)
  const getParsedItems = (items) => {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    if (typeof items === "string") {
      try {
        const parsed = JSON.parse(items);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Failed to parse order items string:", e);
        return [];
      }
    }
    return [];
  };

  const itemsList = getParsedItems(order?.items);
  const totalPages = Math.ceil(itemsList.length / itemsPerPageSide) || 1;

  // 2. Extract current item page slice
  const currentPageSlice = itemsList.slice(
    (itemPage - 1) * itemsPerPageSide,
    itemPage * itemsPerPageSide
  );

  if (itemsList.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-center text-xs text-gray-400 font-medium">
        No item details available for this order.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header bar with total item pagination controls */}
      <div className="flex justify-between items-center pb-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Order Summary ({itemsList.length} {itemsList.length === 1 ? "Item" : "Items"})
        </p>

        {itemsList.length > itemsPerPageSide && (
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
            <span>
              {itemPage} / {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={itemPage === 1}
                onClick={() => setItemPage((p) => Math.max(p - 1, 1))}
                className="p-1 border border-slate-200 rounded hover:bg-slate-100 active:scale-95 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed text-zinc-700"
                aria-label="Previous Item"
              >
                <FiChevronLeft size={12} />
              </button>
              <button
                type="button"
                disabled={itemPage >= totalPages}
                onClick={() => setItemPage((p) => Math.min(p + 1, totalPages))}
                className="p-1 border border-slate-200 rounded hover:bg-slate-100 active:scale-95 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed text-zinc-700"
                aria-label="Next Item"
              >
                <FiChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Render Current Item Page */}
      {currentPageSlice.map((item, idx) => {
        const itemImg = item.image || item.images || "/placeholder.jpeg";
        const color = item.selected_color || item.selectedColor;
        const size = item.selected_size || item.selectedSize;
        const price = item.price ? Number(item.price).toFixed(2) : null;

        return (
          <div
            key={item.id || idx}
            className="bg-gray-50/80 border border-gray-200/80 p-2.5 rounded-xl flex items-center gap-3 transition hover:border-gray-300"
          >
            {/* Image Preview Box */}
            <div className="relative w-12 h-12 bg-white rounded-lg border border-slate-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
              <img
                src={itemImg}
                alt={item.name || "Product Jersey"}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.jpeg";
                }}
              />
            </div>

            {/* Product Details & Variant Badges */}
            <div className="flex flex-col justify-between min-w-0 flex-1 gap-1">
              <div className="text-xs text-gray-800 font-medium truncate">
                <span className="font-black text-orange-500 mr-1.5">
                  {item.quantity || 1}x
                </span>
                {item.name || "Custom Jersey"}
              </div>

              <div className="flex flex-wrap gap-1">
                {price && (
                  <span className="bg-gray-200/80 text-gray-700 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">
                    ${price}
                  </span>
                )}
                {color && (
                  <span className="bg-gray-200/80 text-gray-700 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold truncate max-w-[80px]">
                    {color}
                  </span>
                )}
                {size && (
                  <span className="bg-gray-200/80 text-gray-700 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">
                    {size}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}