"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiLoader, FiCheck, FiMapPin, FiCreditCard, FiAlertTriangle, FiShoppingBag as FiCartIcon } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import useCartStore from "../stores/useCartStore";
import ShoppingPayment from "../components/frontend/ShoppingPayment"; 
import Image from "next/image";
import { toast } from "react-toastify";

export default function CheckOutPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { cart, addToCart } = useCartStore();

  const [step, setStep] = useState(1); 
  const [showExitModal, setShowExitModal] = useState(false);
  const [referrerPath, setReferrerPath] = useState("/products"); // Tracks dynamic origin address page path
  const [checkoutItem, setCheckoutItem] = useState(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    zip: "",
    country: "Nigeria",
  });

  // 1. Capture dynamic document referrer path context only on mount frame execution
  useEffect(() => {
    if (typeof window !== "undefined" && document.referrer) {
      try {
        const referrerUrl = new URL(document.referrer);
        // Exclude cross-origin logins or blank validation loops
        if (referrerUrl.origin === window.location.origin && referrerUrl.pathname !== "/checkout") {
          setReferrerPath(referrerUrl.pathname + referrerUrl.search);
        }
      } catch (e) {
        console.error("Failed parsing referrer path string boundaries:", e);
      }
    }

    const pendingItem = localStorage.getItem("pending_checkout_items");
    if (pendingItem) {
      try {
        const parsed = JSON.parse(pendingItem);
        // Ensure checkoutItem is stored as a single object if parsed as an array
        setCheckoutItem(Array.isArray(parsed) ? parsed[0] : parsed);
      } catch (e) {
        console.error("Failed to parse pending_checkout data", e);
      }
    }
  }, []);

  // Hydrate form inputs
  useEffect(() => {
    const savedForm = localStorage.getItem("Shopping Form");
    if (savedForm) {
      try {
        setFormData(JSON.parse(savedForm));
      } catch (e) {
        console.error("Failed to parse cached shipping form", e);
      }
    } else if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.name?.split(" ")[0] || "",
        lastName: user.name?.split(" ")[1] || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  // Session Redirect Security Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth?mode=signin&message=session_expired");
    }
  }, [user, loading, router]);

  // SECURE ROUTE INTERCEPTOR: Hooks browser popstate buttons natively
  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);

    const handlePopStateIntercept = (event) => {
      event.preventDefault();
      setShowExitModal(true);
      window.history.pushState(null, null, window.location.pathname);
    };

    window.addEventListener("popstate", handlePopStateIntercept);
    return () => window.removeEventListener("popstate", handlePopStateIntercept);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      localStorage.setItem("Shopping Form", JSON.stringify(updated));
      return updated;
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.street || !formData.city) {
      toast.error("Please fill in all required shipping address fields.");
      return;
    }
    setStep(2); 
  };

  const handleManualBackClick = () => {
    setShowExitModal(true);
  };

  const handleConfirmExitAndSave = async () => {
    if (checkoutItem && user?.id) {
      try {
        toast.info("Saving item to your shopping cart...");
        await addToCart(checkoutItem, user.id, user.name);
      } catch (err) {
        console.error("Failed to save pending item to cart:", err);
      } finally {
        localStorage.removeItem("pending_checkout_items");
        localStorage.removeItem("Shopping Form");
      }
    }
    setShowExitModal(false);
    router.push("/carts"); 
  };

  const handleDiscardExit = () => {
    localStorage.removeItem("pending_checkout_items");
    localStorage.removeItem("Shopping Form");
    setShowExitModal(false);
    router.push(referrerPath); 
  };

  // Turn active checkout target cleanly into an array list for mapping
  const activeItems = checkoutItem ? [checkoutItem] : cart;

  const subtotal = activeItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = activeItems.length === 0 ? 0 : subtotal >= 100 ? 0 : 10;
  const discount = subtotal * 0.1;
  const total = subtotal + shipping - discount;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2 bg-zinc-50">
        <FiLoader className="animate-spin text-orange-500" size={24} />
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Verifying secure session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-zinc-900">
      {/* SECURE PROGRESS NAVIGATION BAR */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <button 
            onClick={handleManualBackClick}
            type="button"
            className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-zinc-900 transition flex items-center gap-2 cursor-pointer bg-transparent border-0 outline-none"
          >
            ← Cancel Checkout
          </button>
          <div className="text-xs font-bold uppercase tracking-widest text-orange-500 flex items-center gap-1.5">
            <FiCreditCard /> Secure Checkout Workspace
          </div>
        </div>
      </div>

      {/* CORE CONTENT GRID OVERLAY */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-around shadow-sm">
              <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${step >= 1 ? "text-orange-500" : "text-gray-400"}`}>
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? "bg-orange-500 text-white" : "bg-orange-100 text-orange-600"}`}>
                  {step > 1 ? <FiCheck size={12} /> : "1"}
                </span>
                <span>Shipping</span>
              </div>
              <div className="h-0.5 w-16 bg-gray-200" />
              <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${step === 2 ? "text-orange-500" : "text-gray-400"}`}>
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                  2
                </span>
                <span>Payment</span>
              </div>
            </div>

            {step === 1 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <FiMapPin className="text-orange-500" size={20} />
                  <h2 className="text-lg font-bold tracking-tight">Delivery Address</h2>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-zinc-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-zinc-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john.doe@example.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-zinc-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Street Address *</label>
                    <input
                      type="text"
                      name="street"
                      required
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="Apartment, suite, block unit, etc."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-zinc-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">City *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Lagos"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-zinc-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Zip Code</label>
                      <input
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        placeholder="100001"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-zinc-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Country *</label>
                      <input
                        type="text"
                        name="country"
                        required
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="Nigeria"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-zinc-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-6 bg-[#111827] hover:bg-orange-600 transition-all text-white rounded-xl py-4 font-bold text-xs uppercase tracking-widest shadow-md cursor-pointer flex items-center justify-center gap-2 border-none outline-none"
                  >
                    Proceed to Payment <FiCreditCard size={14} />
                  </button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <ShoppingPayment user={user} setStep={setStep} />
              </div>
            )}
          </div>

          {/* ================= RIGHT COLUMN: ORDER SUMMARY ================= */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold tracking-tight pb-4 border-b border-gray-100 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1 font-semibold">
                  {activeItems.length} {activeItems.length === 1 ? "Item" : "Items"}
                </span>
              </h2>

              <div className="divide-y divide-gray-100 max-h-[240px] overflow-y-auto pr-2 py-2">
                {activeItems.map((item) => {
                  // Resolve fallback for flat images string formats correctly
                  const imageSrc = item.images || item.image || "/placeholder.jpeg";

                  return (
                    <div 
                      key={`${item.productId || item.id}-${item.selectedColor}-${item.selectedSize}`} 
                      className="flex gap-4 py-4 first:pt-2 last:pb-2 items-center"
                    >
                      <div className="relative h-16 w-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                        <Image 
                          src={imageSrc} 
                          alt={item.name || "Jersey Detail"} 
                          fill 
                          className="object-contain p-1" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-zinc-900 truncate">{item.name}</h4>
                        <p className="text-[11px] text-gray-400 font-semibold uppercase mt-0.5">
                          Size: {item.selectedSize?.toUpperCase()} | Color: {item.selectedColor}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500 font-medium">Qty: {item.quantity}</span>
                          <span className="text-sm font-black text-orange-500">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3 text-xs text-gray-500 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-zinc-900 font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount (10%)</span>
                  <span className="text-red-500 font-bold">-${discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-zinc-900 font-bold">{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-base font-black text-zinc-950 pt-3 border-t border-dashed border-gray-100">
                  <span>Total (USD)</span>
                  <span className="text-orange-500">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ================= EXIT INTERCEPTOR MODAL POPUP ================= */}
      {showExitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-sm w-full p-6 shadow-2xl animate-scaleIn text-zinc-900">
            <div className="flex items-center gap-3 text-orange-500 mb-4">
              <div className="p-2 bg-orange-50 rounded-xl">
                <FiAlertTriangle size={24} />
              </div>
              <h3 className="font-black text-lg tracking-tight">Save items to cart?</h3>
            </div>
            
            <p className="text-sm text-gray-500 leading-relaxed">
              You are leaving checkout. Would you like us to save these jersey selections inside your general shopping cart layout so you don't lose them?
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmExitAndSave}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-3 text-sm font-bold shadow-md cursor-pointer transition flex items-center justify-center gap-2 border-none outline-none"
              >
                <FiCartIcon size={14} /> Yes, Save to Cart
              </button>
              <button
                type="button"
                onClick={handleDiscardExit}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl py-3 text-sm font-bold cursor-pointer transition border-none outline-none"
              >
                No, Discard & Leave
              </button>
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="w-full text-center text-xs text-gray-400 font-semibold hover:text-gray-600 transition cursor-pointer mt-1 bg-transparent border-none outline-none"
              >
                Continue Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}