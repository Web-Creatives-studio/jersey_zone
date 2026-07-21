"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaTrash, FaMinus, FaPlus, FaCheck } from "react-icons/fa";
import useCartStore from "../../stores/useCartStore";
import { useAuth } from "../../contexts/AuthContext";

export default function CartItems({ onSelectionChange }) {
  const { user } = useAuth();
  const customerId = user?.id || null;
  const customerName = user?.name || null;

  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCartStore();

  const [selectedItems, setSelectedItems] = useState({});

  // 1. Hydrate checkbox state strictly using database primary key `id`
  useEffect(() => {
    if (cart.length > 0) {
      setSelectedItems((prev) => {
        const updatedSelection = { ...prev };

        let cachedIds = null;
        const savedBatchString = localStorage.getItem("pending_checkout_items");

        if (savedBatchString) {
          try {
            const parsed = JSON.parse(savedBatchString);
            const arrayBatch = Array.isArray(parsed) ? parsed : [parsed];
            // 🌟 STRICT PK MATCH: Extract string `id` directly
            cachedIds = new Set(arrayBatch.map((item) => (typeof item === "string" ? item : item.id)).filter(Boolean));
          } catch (e) {
            console.error("Error parsing cached checkout selections:", e);
          }
        }

        cart.forEach((item) => {
          const rowId = item.id;

          if (updatedSelection[rowId] === undefined) {
            if (cachedIds !== null) {
              updatedSelection[rowId] = cachedIds.has(rowId);
            } else {
              // Default to true on initial load with no cache
              updatedSelection[rowId] = true;
            }
          }
        });

        return updatedSelection;
      });
    }
  }, [cart]);

  // 2. Filter checked list and store in local cache using primary key `id`
  useEffect(() => {
    const selectedList = cart.filter((item) => !!selectedItems[item.id]);

    localStorage.setItem("pending_checkout_items", JSON.stringify(selectedList));

    if (onSelectionChange) {
      onSelectionChange(selectedList);
    }
  }, [selectedItems, cart, onSelectionChange]);

  // Toggle individual item checkbox by row `id`
  const toggleSelection = (id) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle "Select All" / "Deselect All"
  const allSelected =
    cart.length > 0 && cart.every((item) => !!selectedItems[item.id]);

  const toggleSelectAll = () => {
    const nextState = !allSelected;
    const updated = {};
    cart.forEach((item) => {
      updated[item.id] = nextState;
    });
    setSelectedItems(updated);
  };

  return (
    <div className="space-y-4 text-zinc-900">
      {/* ================= BATCH CONTROL HEADER BAR ================= */}
      {cart.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-xl border border-gray-100">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex items-center gap-2.5 text-xs font-bold text-zinc-700 hover:text-orange-500 transition cursor-pointer bg-transparent border-none outline-none"
          >
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                allSelected ? "bg-orange-500 border-orange-500 text-white" : "border-gray-300 bg-white"
              }`}
            >
              {allSelected && <FaCheck size={7} />}
            </div>
            <span>{allSelected ? "Deselect All Items" : "Select All Items"}</span>
          </button>

          <span className="text-[11px] font-semibold text-gray-400">
            {cart.filter((item) => !!selectedItems[item.id]).length} of {cart.length} checked
          </span>
        </div>
      )}

      {/* ================= INDIVIDUAL CART ITEMS FEED ================= */}
      {cart.map((item) => {
        const isChecked = !!selectedItems[item.id];

        return (
          <div
            key={item.id}
            className={`flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 ${
              isChecked ? "border-orange-400 ring-1 ring-orange-400/10" : "border-gray-200 opacity-75"
            }`}
          >
            <div className="flex items-center gap-4 w-full">
              {/* Checkbox Trigger Button */}
              <button
                type="button"
                onClick={() => toggleSelection(item.id)}
                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all shrink-0 ${
                  isChecked ? "bg-orange-500 border-orange-500 text-white" : "border-gray-300 bg-gray-50"
                }`}
              >
                {isChecked && <FaCheck size={8} />}
              </button>

              <div className="flex gap-4 w-full">
                <div className="relative w-24 h-24 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                  <Image
                    src={item.image || item.images || "/placeholder.jpeg"}
                    alt={item.name}
                    fill
                    className="object-contain p-1"
                  />
                </div>

                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 truncate">{item.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Official Team Jersey</p>

                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="bg-gray-100 text-zinc-600 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                        Size: {item.selectedSize?.toUpperCase()}
                      </span>
                      <span className="bg-gray-100 text-zinc-600 rounded-full px-2.5 py-0.5 text-[11px] flex items-center gap-1.5 font-semibold">
                        Color
                        <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ background: item.selectedColor }} />
                      </span>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-center rounded-lg border bg-white border-gray-200 w-fit">
                      <button
                        onClick={() => decreaseQuantity(item, customerId, customerName)}
                        type="button"
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition cursor-pointer text-gray-500"
                      >
                        <FaMinus size={9} />
                      </button>
                      <span className="w-8 text-center font-bold text-xs text-zinc-800">{item.quantity}</span>
                      <button
                        onClick={() => increaseQuantity(item, customerId, customerName)}
                        type="button"
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition cursor-pointer text-gray-500"
                      >
                        <FaPlus size={9} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex md:flex-col items-center justify-between md:items-end gap-4 w-full md:w-auto shrink-0 md:pl-6 border-t md:border-t-0 border-gray-50 pt-3 md:pt-0">
              <div className="text-left md:text-right">
                <p className="text-xl font-black text-orange-500">${(item.price * item.quantity).toFixed(2)}</p>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">${item.price.toFixed(2)} each</p>
              </div>

              <button
                onClick={() => removeFromCart(item, customerId)}
                type="button"
                className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer border-none"
              >
                <FaTrash size={12} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}