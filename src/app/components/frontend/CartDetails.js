"use client";

import React from "react";
import { FaArrowRight } from "react-icons/fa";
import { toast } from "react-toastify";
import Image from "next/image";

export default function CartDetails({ cartItems = [], router, activeStep }) {
  // Calculations run strictly on selected items passed from parent wrapper
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const shipping = cartItems.length === 0 ? 0 : subtotal >= 100 ? 0 : 10;
  const discount = subtotal * 0.1;
  const total = subtotal + shipping - discount;

  const handleNext = () => {
    if (cartItems.length === 0) {
      toast.error("Please pick at least one jersey to proceed to checkout!");
      return;
    }

    localStorage.setItem("pending_checkout_items", JSON.stringify(cartItems));

    router.push("/carts?step=2", { scroll: false });
  };

  return (
    <div className="rounded-3xl bg-white p-6 text-zinc-900">
      <h2 className="text-xl font-bold tracking-tight pb-4 border-b border-gray-100 flex items-center justify-between">
        <span>Order Summary</span>
        <span className="text-xs bg-orange-50 text-orange-600 rounded-full px-2.5 py-1 font-bold">
          {cartItems.length} Selected
        </span>
      </h2>

      {/* Selected Items Display Feed */}
      {cartItems.length === 0 ? (
        <div className="py-6 text-center text-gray-400 text-xs font-medium">
          No items selected for checkout.
        </div>
      ) : (
        <div className="divide-y divide-gray-50 max-h-[200px] overflow-y-auto pr-1 my-2">
          {cartItems.map((item) => {
            const resolvedImgSrc = item.image || item.images || "/placeholder.jpeg";

            return (
              <div 
                key={`${item.id || item.productId}-${item.selectedColor}-${item.selectedSize}`} 
                className="flex gap-4 py-3 first:pt-1 last:pb-1 items-center animate-fadeIn"
              >
                <div className="relative h-14 w-14 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                  <Image
                    src={resolvedImgSrc}
                    alt={item.name || "Jersey Selection"}
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <h4 className="font-bold text-zinc-900 truncate">{item.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-wide">
                    {item.selectedSize?.toUpperCase()} — {item.selectedColor}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-400 font-medium">Qty: {item.quantity}</span>
                    <span className="font-black text-zinc-800">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dynamic Price Calculation Breakdown */}
      <div className="space-y-3.5 text-xs font-medium text-gray-500 pt-4 border-t border-gray-100">
        <div className="flex justify-between">
          <span>Selected Subtotal</span>
          <span className="font-bold text-zinc-900">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Shipping Fee</span>
          {shipping === 0 ? (
            <span className="font-bold text-green-600 uppercase tracking-wider text-[10px]">FREE</span>
          ) : (
            <span className="font-bold text-zinc-900">${shipping.toFixed(2)}</span>
          )}
        </div>

        <div className="flex justify-between">
          <span>Bundle Discount (10%)</span>
          <span className="font-bold text-green-600">-${discount.toFixed(2)}</span>
        </div>

        <hr className="border-gray-100 my-2" />

        <div className="flex justify-between text-base font-black text-zinc-950 pt-1">
          <span>Total Amount</span>
          <span className="text-orange-500 font-black text-lg">${total.toFixed(2)}</span>
        </div>
      </div>

      {subtotal < 100 && subtotal > 0 && (
        <div className="mt-4 rounded-xl bg-orange-50/60 border border-solid border-orange-100 p-3 text-[11px] text-orange-700 font-medium leading-relaxed">
          Add <strong>${(100 - subtotal).toFixed(2)}</strong> more to your selected items to qualify for <strong>FREE Shipping!</strong>
        </div>
      )}

      {/* Step Action Navigation Button */}
      {activeStep === 1 && (
        <button
          onClick={handleNext}
          disabled={cartItems.length === 0}
          type="button"
          className={`mt-5 w-full flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 border-none outline-none ${
            cartItems.length === 0
              ? "bg-gray-100 cursor-not-allowed text-gray-400"
              : "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/10 cursor-pointer"
          }`}
        >
          Continue to Checkout
          <FaArrowRight size={11} />
        </button>
      )}
    </div>
  );
}