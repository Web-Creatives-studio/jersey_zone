"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FaArrowRight } from "react-icons/fa";

export default function ShoppingForm({ setShoppingForm }) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      state: "",
      city: "",
      address: "",
      apartment: "",
      postalCode: "",
      deliveryNote: "",
    },
  });

  
  useEffect(() => {
    const savedData = localStorage.getItem("Shopping Form");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        reset(parsedData);
      } catch (error) {
        console.error("Failed to parse checkout form data from local storage", error);
      }
    }
  }, [reset]);

  const onSubmit = async (data) => {
    
    localStorage.setItem("Shopping Form", JSON.stringify(data));
    
    
    if (typeof setShoppingForm === "function") {
      setShoppingForm(data);
    }

    router.push("/carts?step=3", { scroll: false });
  };

  
  const inputClasses = "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:bg-gray-50";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto">
      {/* Form Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Shipping Address</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Please provide your delivery and contact information below.
        </p>
      </div>

      {/* Section 1: Personal Information */}
      <div className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm space-y-5">
        <h3 className="font-semibold text-lg text-gray-900 border-b border-gray-100 pb-2">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* First Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              placeholder="John"
              disabled={isSubmitting}
              {...register("firstName", { required: "First name is required" })}
              className={inputClasses}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-0.5">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              placeholder="Doe"
              disabled={isSubmitting}
              {...register("lastName", { required: "Last name is required" })}
              className={inputClasses}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-0.5">{errors.lastName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              placeholder="john@email.com"
              disabled={isSubmitting}
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              className={inputClasses}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-0.5">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              placeholder="+234..."
              disabled={isSubmitting}
              {...register("phone", { required: "Phone number is required" })}
              className={inputClasses}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-0.5">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Delivery Address */}
      <div className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm space-y-5">
        <h3 className="font-semibold text-lg text-gray-900 border-b border-gray-100 pb-2">
          Delivery Address
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Country */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              disabled={isSubmitting}
              {...register("country", { required: "Country is required" })}
              className={inputClasses}
            />
            {errors.country && (
              <p className="text-red-500 text-xs mt-0.5">{errors.country.message}</p>
            )}
          </div>

          {/* State */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              disabled={isSubmitting}
              {...register("state", { required: "State is required" })}
              className={inputClasses}
            />
            {errors.state && (
              <p className="text-red-500 text-xs mt-0.5">{errors.state.message}</p>
            )}
          </div>

          {/* City */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              disabled={isSubmitting}
              {...register("city", { required: "City is required" })}
              className={inputClasses}
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-0.5">{errors.city.message}</p>
            )}
          </div>

          {/* Postal Code */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Postal Code</label>
            <input
              type="text"
              disabled={isSubmitting}
              {...register("postalCode")}
              className={inputClasses}
            />
          </div>

          {/* Street Address */}
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Street Address</label>
            <input
              type="text"
              disabled={isSubmitting}
              {...register("address", { required: "Street address is required" })}
              className={inputClasses}
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-0.5">{errors.address.message}</p>
            )}
          </div>

          {/* Apartment / Landmark */}
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Apartment / Suite / Landmark</label>
            <input
              type="text"
              disabled={isSubmitting}
              {...register("apartment")}
              className={inputClasses}
            />
          </div>

          {/* Delivery Note */}
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Delivery Note</label>
            <textarea
              rows={4}
              disabled={isSubmitting}
              placeholder="Optional instructions for the rider or delivery courier..."
              {...register("deliveryNote")}
              className={`${inputClasses} resize-none`}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isSubmitting ? "Processing..." : "Continue to Payment"}
        {!isSubmitting && <FaArrowRight className="w-4 h-4" />}
      </button>
    </form>
  );
}