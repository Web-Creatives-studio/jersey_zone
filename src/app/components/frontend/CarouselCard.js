"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { FiArrowRight, FiLoader, FiChevronLeft, FiChevronRight } from "react-icons/fi";

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

  const handleNextImage = () => {
    if (activeImageIndex < imageUrls.length - 1) {
      setActiveImageIndex((prev) => prev + 1);
    } else {
      setZoomTransition(false);
      setTimeout(() => {
        setActiveProductIndex((prev) => (prev + 1) % featuredProducts.length);
        setActiveImageIndex(0);
        setZoomTransition(true);
      }, 300);
    }
  };

  const handlePrevImage = () => {
    if (activeImageIndex > 0) {
      setActiveImageIndex((prev) => prev - 1);
    } else {
      setZoomTransition(false);
      setTimeout(() => {
        setActiveProductIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
        setActiveImageIndex(0);
        setZoomTransition(true);
      }, 300);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[50vh] sm:h-[60vh] md:h-[70vh] w-full rounded-3xl bg-zinc-950 flex flex-col items-center justify-center gap-3 text-zinc-400 border border-zinc-800 p-6 text-center">
        <FiLoader className="animate-spin text-orange-500" size={32} />
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-zinc-400">
          Loading Featured Jerseys...
        </p>
      </div>
    );
  }

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full min-h-fit sm:min-h-[580px] lg:h-[680px] rounded-[24px] sm:rounded-[32px] overflow-hidden bg-[#111827] text-white shadow-2xl border border-zinc-800">
      {/* Decorative Grid Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/60 via-zinc-950/90 to-zinc-950 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px] sm:bg-[size:24px_24px] pointer-events-none opacity-40 z-10" />

      {/* Main Container Grid Shell */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center py-8 sm:py-12">
        
        {/* ================= LEFT SIDE: COPY WRAPPER ================= */}
        <div className={`lg:col-span-5 flex flex-col justify-center items-center lg:items-start text-center lg:text-left space-y-4 sm:space-y-6 transition-all duration-1000 ease-out order-2 lg:order-1 ${
          zoomTransition ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 -translate-x-4"
        }`}>
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest animate-pulse">
            ★ Special Featured Jersey
          </div>

          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight uppercase text-white">
              {currentProduct.name}
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm lg:text-base max-w-md font-medium leading-relaxed line-clamp-2 sm:line-clamp-3">
              {currentProduct.description || "Experience the absolute peak performance line. Designed with premium ultra-breathable materials engineered to keep you performing at maximum velocity."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-orange-500">
              ${currentProduct.price?.toFixed(2)}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Secure Delivery Included
            </span>
          </div>

          <button
            onClick={() => router.push(`/products/${currentProduct.id}`)}
            className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs uppercase tracking-widest px-8 py-3.5 sm:py-4 rounded-2xl transition-all duration-300 cursor-pointer border-none shadow-lg shadow-orange-500/20"
          >
            Claim Yours Now
            <FiArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* ================= RIGHT SIDE: TRUE CENTER-ANCHORED CAROUSEL ================= */}
        <div className="lg:col-span-7 w-full flex flex-col items-center justify-center relative h-[280px] sm:h-[360px] lg:h-[420px] overflow-hidden order-1 lg:order-2">
          
          {/* Manual Quick Access Controls */}
          <button
            type="button"
            onClick={handlePrevImage}
            aria-label="Previous view"
            className="absolute left-1 sm:left-4 z-40 p-2 sm:p-3 rounded-full bg-zinc-900/80 hover:bg-orange-500 text-white border border-zinc-700/50 backdrop-blur-md transition-all cursor-pointer shadow-lg outline-none"
          >
            <FiChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={handleNextImage}
            aria-label="Next view"
            className="absolute right-1 sm:right-4 z-40 p-2 sm:p-3 rounded-full bg-zinc-900/80 hover:bg-orange-500 text-white border border-zinc-700/50 backdrop-blur-md transition-all cursor-pointer shadow-lg outline-none"
          >
            <FiChevronRight size={16} />
          </button>

          {/* Master Zoom Structure Frame */}
          <div
            className={`w-full h-full relative flex items-center justify-center transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${
              zoomTransition ? "opacity-100 scale-100 blur-none" : "opacity-0 scale-90 blur-md"
            }`}
          >
            {/* 🌟 CENTER TRACK: Scales according to mobile, tablet & desktop screen dimensions */}
            <div className="relative w-[180px] sm:w-[230px] lg:w-[270px] h-[230px] sm:h-[290px] lg:h-[330px] flex items-center justify-center">
              {imageUrls.map((imgUrl, idx) => {
                const isActive = idx === activeImageIndex;
                const offset = idx - activeImageIndex;
                const translateX = offset * 115;

                return (
                  <div
                    key={`${currentProduct.id}-${idx}`}
                    className="absolute w-full h-full transition-all duration-700 ease-in-out box-border"
                    style={{
                      transform: `translateX(${translateX}%) scale(${isActive ? 1.05 : 0.8})`,
                      zIndex: isActive ? 30 : 20 - Math.abs(offset),
                    }}
                  >
                    <div
                      className={`w-full h-full rounded-2xl bg-white/5 border border-solid transition-all duration-700 ease-in-out flex items-center justify-center p-3 sm:p-5 ${
                        isActive
                          ? "border-orange-500/40 bg-white/10 shadow-[0_20px_50px_rgba(249,115,22,0.25)] blur-none opacity-100"
                          : "border-zinc-800/40 blur-[3px] opacity-20 pointer-events-none"
                      }`}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={imgUrl}
                          alt={`${currentProduct.name} - View ${idx}`}
                          fill
                          priority={idx === 0}
                          sizes="(max-width: 640px) 180px, (max-width: 1024px) 230px, 270px"
                          className="object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Slider Pagination Bullets */}
          <div className="absolute bottom-1 sm:bottom-2 flex items-center justify-center gap-1.5 sm:gap-2 z-30">
            {imageUrls.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                aria-label={`Go to image ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 border-none cursor-pointer p-0 ${
                  idx === activeImageIndex ? "w-5 sm:w-6 bg-orange-500" : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                }`}
              />
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}