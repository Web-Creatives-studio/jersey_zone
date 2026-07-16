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

  // 🌟 THE FIX: Hydrate check states from localStorage cache when coming back from later steps
  useEffect(() => {
    if (cart.length > 0) {
      setSelectedItems((prev) => {
        const updatedSelection = { ...prev };
        
        // Check if there is an active batch already saved in checkout cache
        let cachedBatchIds = null;
        const savedBatchString = localStorage.getItem("pending_checkout_items");
        
        if (savedBatchString) {
          try {
            const parsed = JSON.parse(savedBatchString);
            const arrayBatch = Array.isArray(parsed) ? parsed : [parsed];
            cachedBatchIds = new Set(arrayBatch.map((item) => `${item.id}-${item.selectedColor}-${item.selectedSize}`));
          } catch (e) {
            console.error("Failed to parse cached checkout batch parameters:", e);
          }
        }

        cart.forEach((item) => {
          const uniqueKey = `${item.id}-${item.selectedColor}-${item.selectedSize}`;
          
          // Only evaluate if this item key doesn't have a state set yet
          if (updatedSelection[uniqueKey] === undefined) {
            if (cachedBatchIds !== null) {
              // If we have a cache history, match selection from what was saved
              updatedSelection[uniqueKey] = cachedBatchIds.has(uniqueKey);
            } else {
              // If it's a first-time load with no cache, default to true
              updatedSelection[uniqueKey] = true;
            }
          }
        });
        return updatedSelection;
      });
    }
  }, [cart]);

  // Bubble up checked selections to the parent page layout wrapper grid safely
  useEffect(() => {
    const selectedList = cart.filter((item) => {
      const uniqueKey = `${item.id}-${item.selectedColor}-${item.selectedSize}`;
      return !!selectedItems[uniqueKey];
    });
    if (onSelectionChange) {
      onSelectionChange(selectedList);
    }
  }, [selectedItems, cart, onSelectionChange]);

  const toggleSelection = (uniqueKey) => {
    setSelectedItems((prev) => {
      const updated = {
        ...prev,
        [uniqueKey]: !prev[uniqueKey],
      };

      // 🌟 SIDE FIX: Sync localStorage immediately when toggling items on Step 1
      // This keeps Step 2 and Step 3 price calculators completely in sync if they look at cache
      const selectedList = cart.filter((item) => {
        const key = `${item.id}-${item.selectedColor}-${item.selectedSize}`;
        return key === uniqueKey ? !prev[uniqueKey] : !!prev[key];
      });
      localStorage.setItem("pending_checkout_items", JSON.stringify(selectedList));
      
      return updated;
    });
  };

  return (
    <div className="space-y-4 text-zinc-900">
      {cart.map((item) => {
        const uniqueKey = `${item.id}-${item.selectedColor}-${item.selectedSize}`;
        const isChecked = !!selectedItems[uniqueKey];

        return (
          <div
            key={uniqueKey}
            className={`flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 ${
              isChecked ? "border-orange-400 ring-1 ring-orange-400/10" : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-4 w-full">
              {/* Checkbox Icon Element */}
              <button
                type="button"
                onClick={() => toggleSelection(uniqueKey)}
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
                    className="object-contain"
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