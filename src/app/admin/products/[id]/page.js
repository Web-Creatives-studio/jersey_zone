"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import {
  FiArrowLeft,
  FiTrendingUp,
  FiShoppingCart,
  FiEye,
  FiCalendar,
  FiPackage,
  FiLoader,
} from "react-icons/fi";

import EditProduct from "../../../components/admin/EditProduct";

const mockProductAnalytics = {
  metrics: {
    totalClicks: 1420,
    totalPurchases: 340,
    conversionRate: "23.9%",
    totalAmount: 13566.0,
  },
  monthlySales: [
    { month: "Jan", amount: 1200 },
    { month: "Feb", amount: 1900 },
    { month: "Mar", amount: 1500 },
    { month: "Apr", amount: 2400 },
    { month: "May", amount: 3100 },
    { month: "Jun", amount: 3400 },
  ],
};

export default function SingleProduct() {
  const router = useRouter();
  const params = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(false);
  const [timeframe, setTimeframe] = useState("6months");

  useEffect(() => {
    document.body.style.overflowY = editProduct ? "hidden" : "auto";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [editProduct]);

  const fetchProductDetails = useCallback(async () => {
    if (!params?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/products/${params.id}`);

      if (!response.ok) {
        throw new Error("Product data not found");
      }

      const dbProduct = await response.json();

      setProduct({
        id: dbProduct.id || params.id,
        name: dbProduct.name || "Retrieved Product Listing",
        description: dbProduct.description || "on Portfolio Collection",
        images: dbProduct.images || {},
        colors: dbProduct.colors || ["default"],
        sizes: dbProduct.sizes || {}, // Stores objects layout: { "red": { "S": 5 } }
        category: dbProduct.category,
        price: dbProduct.price || 0,
        stock: dbProduct.stock || 0,
        featured: dbProduct.featured || false,
        dateAdded: dbProduct.createdAt
          ? new Date(dbProduct.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Nov 22, 2025",
        ...mockProductAnalytics,
      });
    } catch (error) {
      console.error("Database fetch failed, falling back to mock product text:", error);
      setProduct({
        id: params.id || "prod_001",
        name: "Khadijah & Omolola Boot",
        description: "Premium Edition Portfolio Collection",
        dateAdded: "Nov 22, 2025",
        images: { default: "/images/placeholder.png" },
        colors: ["default"],
        sizes: { default: { "M": 10 } },
        metrics: mockProductAnalytics.metrics,
        monthlySales: mockProductAnalytics.monthlySales,
      });
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  if (loading) {
    return (
      <div className="h-screen bg-zinc-50/50 flex flex-col items-center justify-center gap-3">
        <FiLoader className="animate-spin text-orange-500" size={32} />
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Syncing database metrics...
        </p>
      </div>
    );
  }

  if (!product) return null;

  const maxAmount = Math.max(...product.monthlySales.map((s) => s.amount));

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen w-full bg-zinc-50/50 p-4 lg:p-6 flex flex-col overflow-y-auto lg:overflow-hidden select-none">
      <div className="w-full max-w-7xl mx-auto flex flex-col flex-1 min-h-0 space-y-4 pb-4 lg:pb-0">
        
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between shrink-0">
          <button
            onClick={() => router.push("/admin/products")}
            className="flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-black transition-colors group cursor-pointer"
          >
            <FiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Products
          </button>

          <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setTimeframe("3months")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${timeframe === "3months" ? "bg-black text-white" : "text-zinc-500 hover:text-zinc-900"}`}
            >
              3M
            </button>
            <button
              onClick={() => setTimeframe("6months")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${timeframe === "6months" ? "bg-black text-white" : "text-zinc-500 hover:text-zinc-900"}`}
            >
              6M
            </button>
          </div>
        </div>

        {/* Dynamic Product Title Section */}
        <div className="bg-[#111827] text-white rounded-2xl p-4 lg:p-5 border border-zinc-800 shadow-xl relative overflow-hidden shrink-0 flex flex-col lg:max-h-[38%] min-h-0">
          <div className="absolute right-0 bottom-0 opacity-5 translate-x-16 translate-y-16 pointer-events-none hidden sm:block">
            <FiPackage size={160} className="text-orange-500" />
          </div>

          <div className="relative z-10 flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-start shrink-0 mb-3 gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-orange-500 text-[10px] font-bold uppercase tracking-widest mb-0.5">
                  <FiCalendar size={10} />
                  Added {product.dateAdded}
                </div>
                <h1 className="text-xl lg:text-2xl font-black tracking-tight uppercase truncate text-white">
                  {product.name}
                </h1>
                {product.description && (
                  <p className="text-xs font-medium text-zinc-500 tracking-normal truncate">
                    {product.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => setEditProduct(true)}
                className="px-3 py-1.5 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all shadow-sm shrink-0 cursor-pointer"
              >
                Edit Product
              </button>
            </div>

            {/* VARIANT IMAGES & INDEPENDENT STOCK QUANTITY SECTION */}
            <div className="border-t border-zinc-800/80 pt-3 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {product.colors?.map((color) => {
                  const imageUrl = product.images?.[color] || "/placeholder.png";
                  const colorVariantStockMap = product.sizes?.[color] || {};
                  const availableSizeKeys = Object.keys(colorVariantStockMap);

                  return (
                    <div
                      key={color}
                      className="bg-[#111827]/40 border border-zinc-800/60 p-2.5 rounded-xl flex flex-row items-center gap-3"
                    >
                      <div className="relative w-11 h-11 bg-white rounded-lg p-1 shrink-0 overflow-hidden flex items-center justify-center shadow-inner">
                        <img
                          src={imageUrl}
                          alt={`${product.name} - ${color}`}
                          className="w-full h-full object-contain p-0.5"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-black uppercase text-white tracking-tight truncate flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-zinc-700 block shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            {color}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {availableSizeKeys.length > 0 ? (
                            availableSizeKeys.map((sizeKey) => {
                              const sizeStockCount = colorVariantStockMap[sizeKey] || 0;
                              return (
                                <span
                                  key={sizeKey}
                                  className={`text-[10px] font-bold border px-1.5 py-0.5 rounded text-center uppercase ${
                                    sizeStockCount <= 0
                                      ? "bg-zinc-900 border-zinc-800 text-zinc-600 line-through opacity-40"
                                      : "bg-zinc-800 text-zinc-200 border border-zinc-700/50"
                                  }`}
                                  title={`Available Stock: ${sizeStockCount}`}
                                >
                                  {sizeKey} ({sizeStockCount})
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-[10px] font-medium italic text-zinc-600">No active variants</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid System Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
          
          {/* Left Column: Financials & Chart */}
          <div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
            
            {/* Financial Snapshot Card */}
            <div className="bg-white border border-zinc-100 p-4 rounded-2xl shadow-sm shrink-0">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Financial Snapshot
              </h3>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-zinc-500 block font-medium">
                    Gross Revenue Generated
                  </span>
                  <span className="text-xl font-black text-zinc-900">
                    ${product.metrics.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-zinc-500 block font-medium">
                    Catalog Base Price
                  </span>
                  <span className="text-sm font-bold text-zinc-800">${Number(product.price).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Bar Chart Block */}
            <div className="bg-white border border-zinc-100 p-4 rounded-2xl shadow-sm flex-1 flex flex-col min-h-[220px] lg:min-h-0">
              <div className="shrink-0 mb-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Sales Volume Chart
                </h3>
                <p className="text-zinc-900 font-bold text-xs mt-0.5">
                  Amount ($) per Month
                </p>
              </div>

              <div className="flex-1 flex items-end justify-between gap-1.5 pt-2 min-h-0">
                {product.monthlySales.map((item) => {
                  const percentageHeight = (item.amount / maxAmount) * 100;
                  return (
                    <div
                      key={item.month}
                      className="flex flex-col items-center flex-1 h-full justify-end group"
                    >
                      <div
                        className="w-full relative rounded-t-sm transition-all duration-300 bg-zinc-100 group-hover:bg-orange-500"
                        style={{ height: `${percentageHeight}%` }}
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-20">
                          ${item.amount}
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase text-zinc-400 mt-1.5 tracking-wider">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Interaction Metrics & Venn Diagram Overlay Layout */}
          <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
            
            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
              <div className="bg-white border border-zinc-200 p-3 rounded-xl flex items-center gap-2 shadow-sm hover:border-black transition-all">
                <input type="checkbox" defaultChecked className="accent-black cursor-pointer w-3.5 h-3.5 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block truncate">Clicks</span>
                  <span className="text-base font-black text-zinc-900">{product.metrics.totalClicks}</span>
                </div>
              </div>
              <div className="bg-white border border-zinc-200 p-3 rounded-xl flex items-center gap-2 shadow-sm hover:border-black transition-all">
                <input type="checkbox" defaultChecked className="accent-orange-500 cursor-pointer w-3.5 h-3.5 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block truncate">Purchases</span>
                  <span className="text-base font-black text-zinc-900">{product.metrics.totalPurchases}</span>
                </div>
              </div>
              <div className="bg-white border border-zinc-200 p-3 rounded-xl flex items-center gap-2 shadow-sm hover:border-zinc-400 transition-all">
                <input type="checkbox" className="accent-black cursor-pointer w-3.5 h-3.5 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block truncate">Conversion</span>
                  <span className="text-base font-black text-zinc-900">{product.metrics.conversionRate}</span>
                </div>
              </div>
            </div>

            {/* Engagement Overlap Panel */}
            <div className="bg-white border border-zinc-100 p-4 rounded-2xl shadow-sm flex-1 flex flex-col justify-between min-h-[280px] lg:min-h-0">
              <div className="flex flex-col flex-1 min-h-0 justify-between">
                <div className="flex items-start justify-between shrink-0 gap-2">
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-zinc-900 tracking-tight uppercase">
                      User Engagement Overlap
                    </h2>
                    <p className="text-zinc-500 text-[11px] line-clamp-1">
                      Visualizing user behaviors across clicks and conversions.
                    </p>
                  </div>
                  <span className="flex items-center gap-1 bg-zinc-900 text-white font-bold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider whitespace-nowrap">
                    <FiTrendingUp size={10} className="text-orange-500" />
                    +12.3% MoM
                  </span>
                </div>

                {/* Venn Diagram Visualizers Elements Box */}
                <div className="flex-1 flex justify-center items-center min-h-0 py-2">
                  <div className="relative w-64 h-32 flex items-center justify-center scale-90 sm:scale-100 origin-center">
                    <div className="absolute left-0 w-28 h-28 rounded-full bg-zinc-950/5 border-4 border-black flex flex-col items-center justify-center">
                      <FiEye size={14} className="text-black mb-0.5" />
                      <span className="text-[10px] font-black">Clicks</span>
                      <span className="text-[8px] text-zinc-500 font-bold">Top Funnel</span>
                    </div>
                    <div className="absolute right-0 w-28 h-28 rounded-full bg-orange-500/10 border-4 border-orange-500 flex flex-col items-center justify-center">
                      <FiShoppingCart size={12} className="text-orange-600 mb-0.5" />
                      <span className="text-[10px] font-black text-orange-600">Purchases</span>
                      <span className="text-[8px] text-orange-500 font-bold">Conversions</span>
                    </div>
                    <div className="absolute bg-white px-2 py-0.5 border border-zinc-200 rounded text-[9px] font-black tracking-tight text-center z-10 shadow-sm">
                      Feedback Loop
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Context Metric Banner */}
              <div className="bg-zinc-50 rounded-xl p-2.5 grid grid-cols-2 text-center border border-zinc-100 shrink-0">
                <div>
                  <span className="text-[9px] text-zinc-400 font-bold uppercase block tracking-wider truncate">
                    Cart Abandonment
                  </span>
                  <span className="text-sm font-bold text-zinc-800">76.1%</span>
                </div>
                <div className="border-l border-zinc-200">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase block tracking-wider truncate">
                    Return Customers
                  </span>
                  <span className="text-sm font-bold text-zinc-800">42.8%</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {editProduct && product && (
        <EditProduct
          initialProduct={product}
          setEditProduct={setEditProduct}
          onUpdateSuccess={fetchProductDetails}
        />
      )}
    </div>
  );
}