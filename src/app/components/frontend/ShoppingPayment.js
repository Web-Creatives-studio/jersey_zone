"use client";

import React, { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaLock,
  FaMoneyBillWave,
  FaCreditCard,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useCartStore from "../../stores/useCartStore";
import Script from "next/script";

const paymentMethods = [
  {
    id: "paystack",
    name: "Paystack",
    description: "Debit Card, Bank Transfer, USSD & Mobile Money",
    icon: <FaCreditCard size={24} />,
  },
  {
    id: "cash",
    name: "Cash on Delivery",
    description: "Pay when your order arrives",
    icon: <FaMoneyBillWave size={24} />,
  },
];

export default function ShoppingPayment({ user, setStep }) {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState("paystack");
  const { cart, removeSelectedFromCart } = useCartStore();
  const [checkoutItem, setCheckoutItem] = useState(null);

  const [storedShipping, setStoredShipping] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    zip: "",
    country: "Nigeria",
  });

  useEffect(() => {
    try {
      const localForm = localStorage.getItem("Shopping Form");
      if (localForm) setStoredShipping(JSON.parse(localForm));

      const pendingCheckout = localStorage.getItem("pending_checkout_items");
      if (pendingCheckout) {
        setCheckoutItem(JSON.parse(pendingCheckout));
      }
    } catch (error) {
      console.error("Failed to parse local transaction parameters:", error);
    }
  }, []);

  // Compute active checkout targets (Single buy-now vs multi-item batch selection array)
  const activeItems = Array.isArray(checkoutItem)
    ? checkoutItem
    : checkoutItem
      ? [checkoutItem]
      : cart;

  const subtotal = activeItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shipping = activeItems.length === 0 ? 0 : subtotal >= 100 ? 0 : 10;
  const discount = subtotal * 0.1;
  const total = subtotal + shipping - discount;

  const handlePayment = async () => {
    if (activeItems.length === 0) {
      toast.error("Your checkout pipeline contains no items!");
      return;
    }

    // 🌟 THE FIX: Get the exact rows chosen on Step 1 directly from localStorage
    let purchasedCartRowIds = [];
    const savedBatchString = localStorage.getItem("pending_checkout_items");

    if (savedBatchString) {
      try {
        const parsedBatch = JSON.parse(savedBatchString);
        const batchArray = Array.isArray(parsedBatch)
          ? parsedBatch
          : [parsedBatch];
        purchasedCartRowIds = batchArray.map((item) => item.id);
      } catch (e) {
        console.error("Failed parsing fallback tracking IDs:", e);
      }
    }

    // Fallback security check: if localStorage was empty, use only the current activeItems state mapping
    if (purchasedCartRowIds.length === 0) {
      purchasedCartRowIds = activeItems.map((item) => item.id);
    }

    // 🌟 Make sure we include cart_id explicitly in the payload
    const formattedItems = activeItems.map((item) => ({
      cart_id: item.id, // 👈 THE FIX: Pass the primary key of the cart row
      product_id: item.productId,
      name: item.name,
      quantity: item.quantity,
      selected_color: item.selectedColor,
      selected_size: item.selectedSize,
      price: parseFloat(item.price),
      image: item.images || item.image || "/placeholder.jpeg",
    }));

    const orderPayload = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      customerEmail: storedShipping?.email || user?.email || "guest@email.com",
      customerName:
        `${storedShipping?.firstName || ""} ${storedShipping?.lastName || ""}`.trim() ||
        user?.name ||
        "Guest Buyer",
      subtotal: subtotal,
      discount: discount,
      shipping: shipping,
      totalAmount: total,
      items: formattedItems,
      shippingAddress: {
        street: storedShipping?.street || "Address Details Omitted",
        city: storedShipping?.city || "",
        zip: storedShipping?.zip || "",
        country: storedShipping?.country || "Nigeria",
      },
    };

  if (selectedMethod === "paystack") {
      const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

      if (!publicKey) {
        toast.error("Paystack Key missing! Check NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY in .env.local");
        if (typeof setIsProcessing === "function") setIsProcessing(false);
        return;
      }

      // 1. Amount Guard: Ensure total is a valid number greater than 0
      const calculatedAmountInKobo = Math.round(Number(total) * 100);
      if (isNaN(calculatedAmountInKobo) || calculatedAmountInKobo <= 0) {
        toast.error("Invalid order total amount.");
        if (typeof setIsProcessing === "function") setIsProcessing(false);
        return;
      }

      // 2. SDK Check
      if (typeof window === "undefined" || !window.PaystackPop) {
        toast.error("Paystack SDK loading... Please wait 2 seconds and try again.");
        if (typeof setIsProcessing === "function") setIsProcessing(false);
        return;
      }

      try {
        // Direct handler call
        const paystack = window.PaystackPop.setup({
          key: publicKey,
          email: orderPayload.customerEmail || "customer@email.com",
          amount: calculatedAmountInKobo,
          currency: "NGN",
          ref: orderPayload.id + "_" + Math.floor(Math.random() * 1000),
          metadata: {
            custom_fields: [
              {
                display_name: "Order ID",
                variable_name: "order_id",
                value: orderPayload.id,
              },
            ],
          },
          callback: function (response) {
            toast.success("Payment secured via Paystack!");
            
            createDatabaseOrder({
              ...orderPayload,
              status: "Processing",
              paymentStatus: "Paid",
              userId: user?.id || null,
              paymentReference: response.reference || response.trxref,
            }).then((orderCreated) => {
              if (orderCreated) {
                cleanCompletedCheckoutState(purchasedCartRowIds);
              } else {
                if (typeof setIsProcessing === "function") setIsProcessing(false);
              }
            });
          },
          onClose: function () {
            toast.info("Transaction cancelled.");
            if (typeof setIsProcessing === "function") setIsProcessing(false);
          },
        });

        // Launch modal iframe
        paystack.openIframe();
      } catch (err) {
        console.error("Paystack Inline JS Error Log:", err);
        toast.error("Paystack launch failed: " + (err?.message || "Check browser console"));
        if (typeof setIsProcessing === "function") setIsProcessing(false);
      }
    }

    if (selectedMethod === "cash") {
      toast.success("Creating Cash on Delivery Order...");

      const orderCreated = await createDatabaseOrder({
        ...orderPayload,
        status: "Pending",
        paymentStatus: "Unpaid",
        userId: user?.id || null,
      });

      if (orderCreated) {
        cleanCompletedCheckoutState(purchasedCartRowIds);
      }
    }
  };

  const cleanCompletedCheckoutState = (purchasedCartRowIds) => {
    // Collect primary key IDs directly from active items if not passed in
    const targetIds =
      purchasedCartRowIds && purchasedCartRowIds.length > 0
        ? purchasedCartRowIds
        : activeItems.map((item) => item.id).filter(Boolean);

    if (targetIds.length > 0 && user?.id) {
      removeSelectedFromCart(user.id, targetIds);
    }

    localStorage.removeItem("pending_checkout_items");
    localStorage.removeItem("Shopping Form");
    router.push("/orders", { scroll: false });
  };

  async function createDatabaseOrder(fullOrderData) {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullOrderData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        toast.error(
          responseData.message || "Failed to process order stock limitations.",
        );
        return false;
      }
      return true;
    } catch (err) {
      console.error("Critical database sync down failed:", err);
      toast.error("Network error saving order registration.");
      return false;
    }
  }

  return (
    <>
      <Script
        src="https://js.paystack.co/v1/inline.js"
        strategy="afterInteractive"
      />
      <div className="space-y-6 text-zinc-900">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-950">
            Payment Method
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            Select your preferred payment option to complete your transaction
            securely.
          </p>
        </div>

        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const active = selectedMethod === method.id;

            return (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full rounded-xl border-2 transition-all p-4 text-left flex items-center justify-between gap-4 outline-none border-solid cursor-pointer ${
                  active
                    ? "border-orange-500 bg-orange-50/40"
                    : "border-gray-100 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
                      active
                        ? "bg-orange-500 text-white"
                        : "bg-gray-50 text-gray-600"
                    }`}
                  >
                    {method.icon}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-zinc-900 truncate">
                      {method.name}
                    </h3>
                    <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">
                      {method.description}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    active ? "border-orange-500" : "border-gray-300"
                  }`}
                >
                  {active && (
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl bg-orange-50/40 border border-solid border-orange-100 p-4">
          <div className="flex gap-2.5 items-start">
            <FaLock className="text-orange-500 mt-0.5 shrink-0" size={14} />
            <div>
              <h4 className="font-bold text-xs text-zinc-900">
                Secure Checkout Encryption
              </h4>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Your payment data is securely processed with end-to-end
                encryption via encrypted channels.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-gray-200 rounded-xl px-5 py-3 text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 transition cursor-pointer border-solid outline-none"
          >
            <FaArrowLeft size={10} /> Back to Shipping
          </button>

          <button
            type="button"
            onClick={handlePayment}
            className="w-full sm:flex-1 bg-orange-500 hover:bg-orange-600 transition rounded-xl py-3 text-white font-bold text-xs uppercase tracking-widest text-center shadow-md cursor-pointer border-none outline-none"
          >
            {selectedMethod === "paystack"
              ? "Proceed to Paystack"
              : "Confirm & Place Order"}
          </button>
        </div>
      </div>
    </>
  );
}
