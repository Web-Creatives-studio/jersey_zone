"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CartDetails from "../components/frontend/CartDetails";
import CartItems from "../components/frontend/CartItems";
import ShoppingForm from "../components/frontend/ShoppingForm";
import ShoppingPayment from "../components/frontend/ShoppingPayment";
import useCartStore from "../stores/useCartStore";
import { useAuth } from "../contexts/AuthContext";
import { FiLoader } from "react-icons/fi";

const steps = [
  { id: 1, title: "Shopping Cart" },
  { id: 2, title: "Shopping Address" },
  { id: 3, title: "Payment" },
];

export default function Carts() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { user, loading } = useAuth();
  const fetchUserCart = useCartStore((state) => state.fetchUserCart);
  const { cart,   removeSelectedFromCart } = useCartStore();

  const [selectedCartBatch, setSelectedCartBatch] = useState([]);
  const [shoppingForm, setShoppingForm] = useState(null); 

  const activeStep = Number(searchParams.get("step") || 1);

  useEffect(() => {
    if (!loading && user?.id) {
      fetchUserCart(user.id); 
    }
  }, [user, loading, fetchUserCart]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth?mode=signin&message=session_expired");
    }
  }, [user, loading, router]);

  // 🌟 FIX: Automatically hydrate the selection state array if the user reloads on step 2 or 3
  useEffect(() => {
    if (activeStep > 1) {
      const savedBatch = localStorage.getItem("pending_checkout_items");
      if (savedBatch) {
        try {
          setSelectedCartBatch(JSON.parse(savedBatch));
        } catch (e) {
          console.error("Failed to hydrate checkout selections cache:", e);
        }
      }
    }
  }, [activeStep]);

  const handleStepChange = (targetStep) => {
    if (cart.length === 0 && targetStep.id > 1) return;
    
    if (activeStep === 1 && targetStep.id > 1) {
      if (selectedCartBatch.length === 0) {
        alert("Please select at least one item to proceed to checkout!");
        return;
      }
      // Cache selected subset array values securely before transitioning steps
      localStorage.setItem("pending_checkout_items", JSON.stringify(selectedCartBatch));
    }

    router.push(`/carts?step=${targetStep.id}`, { scroll: false });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2 bg-zinc-50 text-zinc-500">
        <FiLoader className="animate-spin text-orange-500" size={24} />
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Verifying secure session...
        </p>
      </div>
    );
  }

  return (
    <section className="bg-white min-h-screen py-8 lg:py-12 text-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-black tracking-tight">Checkout</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Complete your purchase in a few easy steps.
          </p>
        </div>

        {/* Steps Breadcrumbs Tracker */}
        <div className="flex justify-center overflow-x-auto pb-4">
          <div className="flex items-center gap-3 md:gap-8 min-w-max">
            {steps.map((stepItem, index) => {
              const disabled = cart.length === 0 && stepItem.id > 1;

              return (
                <React.Fragment key={stepItem.id}>
                  <button
                    disabled={disabled}
                    onClick={() => handleStepChange(stepItem)}
                    className={`flex items-center gap-3 transition ${
                      disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        activeStep === stepItem.id
                          ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {stepItem.id}
                    </div>

                    <span className={`hidden sm:block text-xs font-bold uppercase tracking-wider ${
                      activeStep === stepItem.id ? "text-orange-500" : "text-gray-500"
                    }`}>
                      {stepItem.title}
                    </span>
                  </button>

                  {index !== steps.length - 1 && (
                    <div className="w-8 md:w-20 h-[2px] bg-gray-200" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Core Layout Content Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10 items-start">
          
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-5 md:p-8">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <h2 className="text-xl font-bold text-gray-400">Your shopping cart is empty</h2>
                </div>
              ) : (
                <>
                  {activeStep === 1 && (
                    <CartItems onSelectionChange={setSelectedCartBatch} />
                  )}

                  {activeStep === 2 && (
                    <ShoppingForm setShoppingForm={setShoppingForm} />
                  )}

                  {activeStep === 3 && (() => {
                    const isFormFilled = shoppingForm && Object.keys(shoppingForm).length > 0;
                    const hasSavedForm = typeof window !== "undefined" && localStorage.getItem("Shopping Form");

                    if (!isFormFilled && !hasSavedForm) {
                      return (
                        <div className="flex flex-col items-center justify-center text-center p-8 bg-orange-50/50 border border-orange-200/60 rounded-2xl my-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">Shipping Information Missing</h3>
                          <p className="text-gray-600 max-w-sm mb-6 text-xs leading-relaxed">
                            Please fill out your shipping and delivery details before proceeding to payment options.
                          </p>
                          <button
                            onClick={() => router.push("/carts?step=2", { scroll: false })}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition cursor-pointer border-none"
                          >
                            Fill out Shipping Form
                          </button>
                        </div>
                      );
                    }

                    return <ShoppingPayment cart={selectedCartBatch} user={user} />;
                  })()}
                </>
              )}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: STICKY LIVE CALCULATOR ================= */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-2">
              {/* 🌟 FIXED: Consistently relies on selectedCartBatch state fields across all steps */}
              <CartDetails
                cartItems={selectedCartBatch}
                router={router}
                activeStep={activeStep}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}