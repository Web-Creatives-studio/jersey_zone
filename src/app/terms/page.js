"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { FiShield, FiFileText, FiLoader } from "react-icons/fi";

function TermsContent() {
  return (
    <div className="min-h-screen bg-gray-50 text-zinc-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 border border-orange-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <FiFileText size={12} /> Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
            TERMS & <span className="text-orange-500">CONDITIONS</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Last Updated: July 2026. Please read these terms carefully before utilizing the Jersey Zone storefront or services.
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-sm space-y-8 text-xs sm:text-sm text-gray-600 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-base font-black text-zinc-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or placing an order on Jersey Zone, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, please discontinue using our store.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black text-zinc-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> 2. Product Availability & Pricing
            </h2>
            <p>
              All listed products are subject to stock availability. Prices are listed in USD or local currency equivalents. We reserve the right to modify prices or discontinue items without prior notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black text-zinc-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> 3. Order Processing & Payments
            </h2>
            <p>
              Orders are confirmed once full payment is authorized via our secure payment partners (e.g., Paystack). We reserve the right to decline or cancel any order flagged for potential fraud or address mismatches.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black text-zinc-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> 4. Custom Kit Printings
            </h2>
            <p>
              Please review all custom name and number entries carefully during checkout. Custom player-printed kits cannot be returned or exchanged unless the defect originates from manufacturing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black text-zinc-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> 5. Limitation of Liability
            </h2>
            <p>
              Jersey Zone shall not be held liable for indirect or consequential damages resulting from courier shipping delays, natural disasters, or customs hold-ups outside our direct operational control.
            </p>
          </section>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span className="text-gray-400">Have questions regarding our legal policies?</span>
            <Link href="/contact" className="font-bold text-orange-500 hover:underline">
              Contact Legal Support &rarr;
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

function TermsFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
      <FiLoader className="animate-spin text-orange-500" size={32} />
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Terms...</p>
    </div>
  );
}

export default function TermsPage() {
  return (
    <Suspense fallback={<TermsFallback />}>
      <TermsContent />
    </Suspense>
  );
}