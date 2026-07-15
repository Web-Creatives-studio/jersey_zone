"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { FiArrowRight, FiLoader } from "react-icons/fi";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function CarouselCard() {
  const router = useRouter();
  const { data: prod = [], error, isLoading } = useSWR("/api/products", fetcher);
  
  const products = Array.isArray(prod) ? prod : prod?.products || [];
  const featuredProducts = products.filter((product) => product.featured === true);

  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomTransition, setZoomTransition] = useState(true); 

  const currentProduct = featuredProducts[activeProductIndex] || null;

  const getProductImageUrls = (product) => {
    if (!product) return ["/placeholder.jpeg"];
    try {
      if (typeof product.images === "string") {
        if (product.images.startsWith("{")) {
          const parsed = JSON.parse(product.images);
          return Object.values(parsed);
        }
        return [product.images]; 
      } else if (product.images && typeof product.images === "object") {
        return Object.values(product.images);
      }
    } catch (e) {
      console.error("Error parsing product images:", e);
    }
    return ["/placeholder.jpeg"];
  };

  const imageUrls = getProductImageUrls(currentProduct);

  useEffect(() => {
    if (featuredProducts.length === 0 || imageUrls.length === 0) return;

    const interval = setInterval(() => {
      if (activeImageIndex < imageUrls.length - 1) {
        setActiveImageIndex((prev) => prev + 1);
      } else {
        setZoomTransition(false); 

        setTimeout(() => {
          setActiveProductIndex((prevProductIdx) => (prevProductIdx + 1) % featuredProducts.length);
          setActiveImageIndex(0);
          setZoomTransition(true); 
        }, 600); 
      }
    }, 4000); 

    return () => clearInterval(interval);
  }, [activeImageIndex, imageUrls.length, featuredProducts.length]);

  if (isLoading) {
    return (
      <div className="h-[60vh] md:h-[70vh] w-full rounded-3xl bg-zinc-50 flex flex-col items-center justify-center gap-2 text-zinc-400 border border-gray-100">
        <FiLoader className="animate-spin text-orange-500" size={32} />
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Loading Featured Jerseys...
        </p>
      </div>
    );
  }

  if (featuredProducts.length === 0) {
    return null; 
  }

  return (
    <div className="relative w-full min-h-[70vh] md:h-[75vh] rounded-[32px] overflow-hidden bg-[#111827] text-white shadow-2xl border border-zinc-800">
      {/* Decorative Grid Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/50 via-zinc-950/90 to-zinc-950 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40 z-10" />

      {/* Main Container Grid Shell */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12">
        
        {/* ================= LEFT SIDE: COPY WRAPPER ================= */}
        <div className={`lg:col-span-5 flex flex-col justify-center items-start text-left space-y-4 md:space-y-6 transition-all duration-1000 ease-out ${
          zoomTransition ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 -translate-x-4"
        }`}>
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse">
            ★ Special Featured Jersey
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight uppercase text-white">
              {currentProduct.name}
            </h1>
            <p className="text-zinc-400 text-sm md:text-base max-w-md font-medium leading-relaxed line-clamp-3">
              {currentProduct.description || "Experience the absolute peak performance line. Designed with premium ultra-breathable materials engineered to keep you performing at maximum velocity."}
            </p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-orange-500">
              ${currentProduct.price?.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Secure Delivery Included
            </span>
          </div>

          <button
            onClick={() => router.push(`/products/${currentProduct.id}`)}
            className="group flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-2xl transition-all duration-300 cursor-pointer border-none shadow-lg shadow-orange-500/20"
          >
            Claim Yours Now
            <FiArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* ================= RIGHT SIDE: TRUE CENTER-ANCHORED CAROUSEL ================= */}
        <div className="lg:col-span-7 w-full flex flex-col items-center justify-center relative h-[400px] overflow-hidden">
          
          {/* Master Zoom Structure Frame */}
          <div
            className={`w-full h-full relative flex items-center justify-center transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${
              zoomTransition ? "opacity-100 scale-100 blur-none" : "opacity-0 scale-90 blur-md"
            }`}
          >
            {/* 🌟 IRON-CLAD CENTER TRACK: Children are positioned absolutely relative to this exact center point */}
            <div className="relative w-[240px] md:w-[280px] h-[320px] flex items-center justify-center">
              {imageUrls.map((imgUrl, idx) => {
                const isActive = idx === activeImageIndex;
                
                // Calculate dynamic offset distance from the currently active index
                const offset = idx - activeImageIndex;
                
                // Generate layout positions: active item is at 0px, others slide left/right by exactly 115% width
                const translateX = offset * 115; 

                return (
                  <div
                    key={`${currentProduct.id}-${idx}`}
                    className="absolute w-full h-full transition-all duration-700 ease-in-out box-border"
                    style={{
                      transform: `translateX(${translateX}%) scale(${isActive ? 1.1 : 0.85})`,
                      zIndex: isActive ? 30 : 20 - Math.abs(offset),
                    }}
                  >
                    <div
                      className={`w-full h-full rounded-2xl bg-white/5 border border-solid transition-all duration-700 ease-in-out flex items-center justify-center p-4 ${
                        isActive
                          ? "border-orange-500/40 bg-white/10 shadow-[0_25px_60px_rgba(249,115,22,0.2)] blur-none opacity-100"
                          : "border-zinc-800/40 blur-[3px] opacity-20 pointer-events-none"
                      }`}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={imgUrl}
                          alt={`${currentProduct.name} - View ${idx}`}
                          fill
                          priority={idx === 0}
                          className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Slider Pagination Bullets */}
          <div className="absolute bottom-0 flex gap-2 z-30">
            {imageUrls.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === activeImageIndex ? "w-6 bg-orange-500" : "w-1.5 bg-zinc-700"
                }`}
              />
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}