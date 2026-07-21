"use client";

import React from "react";
import Link from "next/link";
import { FiShield, FiTruck, FiAward, FiUsers } from "react-icons/fi";
import CarouselCard from "../components/frontend/CarouselCard";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            About Jersey Zone
          </span>
          <h1 className="text-3xl sm:text-5xl font-black italic tracking-wider text-zinc-950">
            ENGINEERED FOR THE <span className="text-orange-500">PASSIONATE</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Jersey Zone is your premium destination for authentic, high-quality sports kits. Whether you represent your local club or support top-tier global teams, we bring official kits straight to your doorstep.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <FiShield size={24} />,
              title: "100% Authentic",
              desc: "Directly sourced from verified manufacturers.",
            },
            {
              icon: <FiTruck size={24} />,
              title: "Swift Delivery",
              desc: "Nationwide tracking and express shipping.",
            },
            {
              icon: <FiAward size={24} />,
              title: "Premium Fabric",
              desc: "Breathable, high-grade athletic weaves.",
            },
            {
              icon: <FiUsers size={24} />,
              title: "Global Community",
              desc: "Trusted by thousands of fans world-wide.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-3"
            >
              <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                {item.icon}
              </div>
              <h3 className="font-bold text-sm text-zinc-900">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Call To Action */}
        <div className="bg-[#111827] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-black italic tracking-wider">
            READY TO REP YOUR <span className="text-orange-500">COLORS?</span>
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto">
            Explore our latest collections of home, away, and classic vintage kits today.
          </p>
          <Link
            href="/products"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl transition shadow-lg"
          >
            Browse Products
          </Link>
        </div>

            <CarouselCard/>
      </div>

  
    </div>
  );
}