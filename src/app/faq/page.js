"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { FiChevronDown, FiSearch, FiHelpCircle, FiMail, FiLoader } from "react-icons/fi";

const faqData = [
  {
    category: "orders",
    question: "How long will it take to process my order?",
    answer: "Orders are typically processed within 1 to 2 business days. Once shipped, you will receive an automatic tracking notification via email and in your account dashboard."
  },
  {
    category: "orders",
    question: "Can I change or cancel my order after placing it?",
    answer: "We process orders quickly to get your kit delivered as fast as possible. If you need to modify or cancel your order, please contact support within 1 hour of purchase."
  },
  {
    category: "shipping",
    question: "Do you ship internationally?",
    answer: "Yes, we offer worldwide delivery via express air logistics. Shipping rates and delivery times are calculated at checkout based on your destination."
  },
  {
    category: "shipping",
    question: "How can I track my shipment?",
    answer: "You can track your package anytime by visiting your Orders page in your profile dashboard or by clicking the tracking link provided in your order notification."
  },
  {
    category: "products",
    question: "Are all jerseys 100% authentic?",
    answer: "Absolutely. All kit releases hosted on Jersey Zone are sourced directly from authorized brand distributors and official team logistics partners."
  },
  {
    category: "products",
    question: "How do I choose the correct jersey size?",
    answer: "We recommend checking our Size Guide on each product page. Player Version kits feature an athletic/slim fit, while Fan Version kits offer a standard relaxed fit."
  },
  {
    category: "returns",
    question: "What is your return policy?",
    answer: "We offer a 14-day hassle-free return window for unworn items in their original packaging with tags attached. Custom player-printed kits are final sale unless defective."
  }
];

function FAQContent() {
  const [openIndex, setOpenIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaqs = faqData.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-zinc-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-[#111827] text-white rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            Help & Knowledgebase
          </span>
          <h1 className="text-3xl sm:text-4xl font-black italic tracking-wide">
            FREQUENTLY ASKED <span className="text-orange-500">QUESTIONS</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-lg mx-auto">
            Got questions about sizing, international delivery, or custom order printings? We've got answers.
          </p>

          {/* Search Input */}
          <div className="max-w-md mx-auto pt-2">
            <div className="flex items-center bg-white/10 border border-white/20 rounded-2xl px-4 py-3 focus-within:border-orange-500 focus-within:bg-white/15 transition">
              <FiSearch className="text-gray-400 mr-2 shrink-0" size={16} />
              <input
                type="text"
                placeholder="Search topics or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm outline-none text-white placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          {[
            { id: "all", label: "All Topics" },
            { id: "orders", label: "Orders & Payment" },
            { id: "shipping", label: "Shipping & Delivery" },
            { id: "products", label: "Authenticity & Sizing" },
            { id: "returns", label: "Returns & Exchanges" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id);
                setOpenIndex(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border-none outline-none ${
                activeCategory === tab.id
                  ? "bg-[#111827] text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        {filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3 shadow-sm">
            <FiHelpCircle className="mx-auto text-orange-500" size={32} />
            <h3 className="font-bold text-sm text-zinc-900">No matching questions found</h3>
            <p className="text-xs text-gray-400">
              Try adjusting your search terms or select another topic category.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-zinc-900 hover:text-orange-500 transition cursor-pointer bg-transparent border-none outline-none"
                  >
                    <span className="pr-4">{faq.question}</span>
                    <FiChevronDown
                      size={18}
                      className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-orange-500" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-500 leading-relaxed border-t border-gray-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Support Banner */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-zinc-900">Still have questions?</h3>
            <p className="text-xs text-gray-400">Our support team is on standby to help you with your order.</p>
          </div>
          <Link
            href="/contact"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-md shrink-0"
          >
            <FiMail size={14} /> Contact Support
          </Link>
        </div>

      </div>
    </div>
  );
}

function FAQFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
      <FiLoader className="animate-spin text-orange-500" size={32} />
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading FAQ...</p>
    </div>
  );
}

export default function FAQPage() {
  return (
    <Suspense fallback={<FAQFallback />}>
      <FAQContent />
    </Suspense>
  );
}