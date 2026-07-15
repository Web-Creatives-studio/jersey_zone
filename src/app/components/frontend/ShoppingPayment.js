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
  const { cart,   removeSelectedFromCart } = useCartStore();
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
    // 1. Recover the dynamic shipping credentials stored by Step 1
    try {
      const localForm = localStorage.getItem("Shopping Form");
      if (localForm) setStoredShipping(JSON.parse(localForm));
      
      const pendingCheckout = localStorage.getItem("pending_checkout");
      if (pendingCheckout) setCheckoutItem(JSON.parse(pendingCheckout));
    } catch (error) {
      console.error("Failed to parse local transaction parameters:", error);
    }
  }, []);

  // 2. Select between dynamic single product buy-now state or global cart storage state
  const activeItems = checkoutItem ? [checkoutItem] : cart;

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

    const formattedItems = activeItems.map((item) => ({
      product_id: item.productId || item.id, 
      name: item.name,
      quantity: item.quantity,
      selected_color: item.selectedColor,
      selected_size: item.selectedSize,
      price: parseFloat(item.price),
      image: item.images || "/placeholder.jpeg", // 👈 Securely passes clean database-friendly string
    }));

    const orderPayload = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      customerEmail: storedShipping?.email || user?.email || "guest@email.com",
      customerName: `${storedShipping?.firstName || ""} ${storedShipping?.lastName || ""}`.trim() || user?.name || "Guest Buyer",
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
      if (!window.PaystackPop) {
        toast.error("Paystack SDK failed to load. Please refresh and try again.");
        return;
      }

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: orderPayload.customerEmail,
        amount: Math.round(orderPayload.totalAmount * 100), 
        currency: "NGN",
        metadata: {
          custom_fields: [
            {
              display_name: "Order ID",
              variable_name: "order_id",
              value: orderPayload.id,
            },
          ],
        },
        callback: async (reference) => {
          toast.success("Payment secured via Paystack!");

          const orderCreated = await createDatabaseOrder({
            ...orderPayload,
            status: "Processing",
            paymentStatus: "Paid",
            userId: user?.id || null, 
            paymentReference: reference.reference,
          });

          if (orderCreated) {
            cleanCompletedCheckoutState();
          }
        },
        onClose: () => {
          toast.error("Transaction cancelled by user.");
        },
      });

      handler.openIframe();
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
        cleanCompletedCheckoutState();
      }
    }
  };

// Locate this function inside your ShoppingPayment.jsx component:

  const cleanCompletedCheckoutState = () => {
    // 🌟 THE FIX: Remove only checked-out selections from cart instead of bulk clearing
    if (!checkoutItem) {
      // Pass the customerId and the active selected item arrays
      removeSelectedFromCart(user?.id, cart);
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
        toast.error(responseData.message || "Failed to process order stock limitations.");
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
          <h2 className="text-xl font-bold tracking-tight text-zinc-950">Payment Method</h2>
          <p className="text-gray-500 text-xs mt-1">
            Select your preferred payment option to complete your transaction securely.
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
                      active ? "bg-orange-500 text-white" : "bg-gray-50 text-gray-600"
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
                  {active && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl bg-orange-50/40 border border-solid border-orange-100 p-4">
          <div className="flex gap-2.5 items-start">
            <FaLock className="text-orange-500 mt-0.5 shrink-0" size={14} />
            <div>
              <h4 className="font-bold text-xs text-zinc-900">Secure Checkout Encryption</h4>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Your payment data is securely processed with end-to-end encryption via encrypted channels.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          {/* Back button safely toggles Step counter state wrapper rather than popping page location rules */}
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
            {selectedMethod === "paystack" ? "Proceed to Paystack" : "Confirm & Place Order"}
          </button>
        </div>
      </div>
    </>
  );
}