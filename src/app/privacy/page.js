"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { FiShield, FiLock, FiLoader } from "react-icons/fi";

function PrivacyContent() {
  return (
    <div className="min-h-screen bg-gray-50 text-zinc-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <FiLock size={12} /> Data Protection Policy
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
            PRIVACY <span className="text-orange-500">POLICY</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Last Updated: July 2026. At Jersey Zone, protecting your personal information and privacy is our top priority.
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-sm space-y-8 text-xs sm:text-sm text-gray-600 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-base font-black text-zinc-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> 1. Information We Collect
            </h2>
            <p>
              We collect essential information required to process and fulfill your kit orders, including your full name, email address, physical delivery address, and contact telephone number.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black text-zinc-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> 2. Payment Security
            </h2>
            <p>
              Jersey Zone does not store raw credit or debit card credentials on our servers. All financial transactions are securely processed using end-to-end encryption via PCI-compliant payment gateways.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black text-zinc-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> 3. How We Use Your Data
            </h2>
            <p>
              Your personal data is strictly used for order fulfillment, order status notifications, real-time tracking updates, and optional promotional announcements. We never sell or lease customer information to third-party brokers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black text-zinc-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> 4. Cookies & Analytics
            </h2>
            <p>
              We use minimal functional cookies to keep track of your shopping cart state and active session details. You can disable cookies in your browser settings at any time without restricting core shopping capabilities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black text-zinc-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> 5. Data Subject Rights
            </h2>
            <p>
              You reserve the right to request a full copy of your personal data or request permanent deletion of your store account by submitting a query to our privacy officer.
            </p>
          </section>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span className="text-gray-400">Want to request account data deletion?</span>
            <Link href="/contact" className="font-bold text-orange-500 hover:underline">
              Submit Privacy Request &rarr;
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

function PrivacyFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
      <FiLoader className="animate-spin text-orange-500" size={32} />
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Privacy Policy...</p>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <Suspense fallback={<PrivacyFallback />}>
      <PrivacyContent />
    </Suspense>
  );
}