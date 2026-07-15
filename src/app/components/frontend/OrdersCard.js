import React from "react";
import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
export default function OrdersCard({ order }) {
  const [itemPage, setItemPage] = useState(1);
  const itemsPerPageSide = 1;
  return (
    <div className="space-y-3">
      {order.items
        .slice((itemPage - 1) * itemsPerPageSide, itemPage * itemsPerPageSide)

        .map((item, idx) => (
          <div className="div" key={idx}>
            <div className="flex justify-between items-center pb-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Order Summary
              </p>

              {order.items.length > itemsPerPageSide && (
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                  <span>
                    {itemPage}/
                    {Math.ceil(order.items.length / itemsPerPageSide)}
                  </span>
                  <div className="flex gap-0.5">
                    <button
                      type="button"
                      disabled={itemPage === 1}
                      onClick={() => {
                        setItemPage((p) => Math.max(p - 1, 1));
                      }}
                      className="p-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
                    >
                      <FiChevronLeft size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={
                        itemPage >=
                        Math.ceil(order.items.length / itemsPerPageSide)
                      }
                      onClick={() => {
                        setItemPage((p) => p + 1);
                        console.log(order.items);
                      }}
                      className="p-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
                    >
                      <FiChevronRight size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-100 p-2 rounded-xl flex items-center gap-3">
              <img
                src={item.image || "/products/default.png"}
                alt={item.name}
                className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
              />
              <div className="flex flex-col justify-between min-w-0 flex-1 gap-1">
                <div className="text-xs text-gray-700 truncate">
                  <span className="font-bold text-orange-500 mr-1">
                    {item.quantity}x
                  </span>
                  {item.name}
                </div>

                <div className="flex flex-wrap gap-1">
                  {item.price && (
                    <span className="bg-gray-200/70 text-gray-600 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">
                      ${item.price}
                    </span>
                  )}
                  {item.selected_color && (
                    <span className="bg-gray-200/70 text-gray-600 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold truncate max-w-[50px]">
                      {item.selected_color}
                    </span>
                  )}
                  {item.selected_size && (
                    <span className="bg-gray-200/70 text-gray-600 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">
                      {item.selected_size}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
