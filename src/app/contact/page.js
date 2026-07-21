"use client";

import React, { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiSend } from "react-icons/fi";
import { toast } from "react-toastify";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Thank you! Your message has been sent.");
      setLoading(false);
      e.target.reset();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            GET IN <span className="text-orange-500">TOUCH</span>
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm max-w-lg mx-auto">
            Have questions about kit sizing, order statuses, or custom orders? Reach out to our support team anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-sm">
              <h3 className="font-bold text-base text-zinc-900 border-b border-gray-100 pb-3">
                Contact Information
              </h3>
              
              <div className="space-y-4 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl">
                    <FiPhone size={16} />
                  </div>
                  <span>+12 222 5456 888</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl">
                    <FiMail size={16} />
                  </div>
                  <span>support@jerseyzone.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl">
                    <FiMapPin size={16} />
                  </div>
                  <span>Lagos, Nigeria</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 focus:bg-white transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can we help you today?"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 focus:bg-white transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#111827] hover:bg-orange-600 transition text-white font-bold text-xs uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? "Sending..." : "Send Message"} <FiSend size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}