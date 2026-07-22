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
  FiDollarSign,
  FiCheck,
  FiShoppingBag,
} from "react-icons/fi";

import EditProduct from "../../../components/admin/EditProduct";

export default function SingleProduct() {
  const router = useRouter();
  const params = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(false);
  const [timeframe, setTimeframe] = useState("6months");
  const [selectedAnalyticsColor, setSelectedAnalyticsColor] = useState("default");

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

      // Safely normalize images & sizes from DB
      const parsedImages =
        typeof dbProduct.images === "string"
          ? JSON.parse(dbProduct.images)
          : dbProduct.images || {};
      const parsedSizes =
        typeof dbProduct.sizes === "string"
          ? JSON.parse(dbProduct.sizes)
          : dbProduct.sizes || {};

      const colorsList = Array.isArray(dbProduct.colors)
        ? dbProduct.colors
        : Object.keys(parsedSizes).length > 0
        ? Object.keys(parsedSizes)
        : ["default"];

      const analytics = dbProduct.analytics || {
        cartStats: {},
        revenueStats: {},
        salesCountStats: {},
      };

      // Calculate total gross revenue and purchases across all variants
      const calculatedRevenue = Object.values(analytics.revenueStats || {}).reduce(
        (sum, val) => sum + Number(val || 0),
        0
      );
      const calculatedPurchases = Object.values(analytics.salesCountStats || {}).reduce(
        (sum, val) => sum + Number(val || 0),
        0
      );
      const calculatedCartAdditions = Object.values(analytics.cartStats || {}).reduce(
        (sum, val) => sum + Number(val || 0),
        0
      );

      setSelectedAnalyticsColor((colorsList[0] || "default").toLowerCase());

      setProduct({
        id: dbProduct.id || params.id,
        name: dbProduct.name || "Retrieved Product Listing",
        description: dbProduct.description || "",
        images: parsedImages,
        colors: colorsList,
        sizes: parsedSizes,
        category: dbProduct.category || "General",
        price: Number(dbProduct.price || 0),
        stock: Number(dbProduct.stock || 0),
        dateAdded: dbProduct.createdAt
          ? new Date(dbProduct.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "N/A",
        analytics,
        metrics: {
          totalClicks: calculatedCartAdditions * 3 + calculatedPurchases,
          totalPurchases: calculatedPurchases,
          totalCarts: calculatedCartAdditions,
          conversionRate:
            calculatedCartAdditions + calculatedPurchases > 0
              ? `${((calculatedPurchases / (calculatedCartAdditions + calculatedPurchases)) * 100).toFixed(1)}%`
              : "0.0%",
          totalAmount: calculatedRevenue,
        },
        monthlySales: [
          { month: "Jan", amount: Math.round(calculatedRevenue * 0.1) },
          { month: "Feb", amount: Math.round(calculatedRevenue * 0.15) },
          { month: "Mar", amount: Math.round(calculatedRevenue * 0.12) },
          { month: "Apr", amount: Math.round(calculatedRevenue * 0.18) },
          { month: "May", amount: Math.round(calculatedRevenue * 0.22) },
          { month: "Jun", amount: Math.round(calculatedRevenue * 0.23) },
        ],
      });
    } catch (error) {
      console.error("Database fetch failed:", error);
      setProduct(null);
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

  if (!product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3 bg-zinc-50">
        <h2 className="text-lg font-bold text-zinc-800">Product Not Found</h2>
        <button
          onClick={() => router.push("/admin/products")}
          className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  const maxAmount = Math.max(...product.monthlySales.map((s) => s.amount), 100);

  // Active color variant stats
  const activeColorKey = selectedAnalyticsColor.toLowerCase();
  const colorSizesObj = product.sizes?.[activeColorKey] || {};
  const activeColorSizes = Object.keys(colorSizesObj);

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
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                timeframe === "3months" ? "bg-black text-white" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              3M
            </button>
            <button
              onClick={() => setTimeframe("6months")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                timeframe === "6months" ? "bg-black text-white" : "text-zinc-500 hover:text-zinc-900"
              }`}
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
                  <p className="text-xs font-medium text-zinc-400 tracking-normal line-clamp-1">
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
                  const colorKey = color.toLowerCase();
                  const imageUrl = product.images?.[colorKey] || product.images?.[color] || "/placeholder.jpeg";
                  const colorVariantStockMap = product.sizes?.[colorKey] || product.sizes?.[color] || {};
                  const availableSizeKeys = Object.keys(colorVariantStockMap);

                  return (
                    <div
                      key={color}
                      onClick={() => setSelectedAnalyticsColor(colorKey)}
                      className={`p-2.5 rounded-xl flex flex-row items-center gap-3 transition cursor-pointer border ${
                        selectedAnalyticsColor === colorKey
                          ? "bg-orange-500/10 border-orange-500/80"
                          : "bg-[#111827]/40 border-zinc-800/60 hover:border-zinc-700"
                      }`}
                    >
                      <div className="relative w-11 h-11 bg-white rounded-lg p-1 shrink-0 overflow-hidden flex items-center justify-center shadow-inner">
                        <img
                          src={imageUrl}
                          alt={`${product.name} - ${color}`}
                          className="w-full h-full object-contain p-0.5"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.jpeg";
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-black uppercase text-white tracking-tight truncate flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-zinc-700 block shrink-0"
                              style={{ backgroundColor: colorKey }}
                            />
                            {color}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {availableSizeKeys.length > 0 ? (
                            availableSizeKeys.map((sizeKey) => {
                              const sizeStockCount = Number(colorVariantStockMap[sizeKey] || 0);
                              return (
                                <span
                                  key={sizeKey}
                                  className={`text-[10px] font-bold border px-1.5 py-0.5 rounded text-center uppercase ${
                                    sizeStockCount <= 0
                                      ? "bg-zinc-900 border-zinc-800 text-zinc-600 line-through opacity-40"
                                      : "bg-zinc-800 text-zinc-200 border-zinc-700/50"
                                  }`}
                                  title={`Available Stock: ${sizeStockCount}`}
                                >
                                  {sizeKey} ({sizeStockCount})
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-[10px] font-medium italic text-zinc-600">
                              No active variants
                            </span>
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
                    ${product.metrics.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-zinc-500 block font-medium">
                    Catalog Base Price
                  </span>
                  <span className="text-sm font-bold text-zinc-800">
                    ${product.price.toFixed(2)}
                  </span>
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

          {/* Right Column: Interaction Metrics & Variant Analytics */}
          <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
            
            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
              <div className="bg-white border border-zinc-200 p-3 rounded-xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <FiShoppingBag size={18} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block truncate">
                    Active Carts
                  </span>
                  <span className="text-base font-black text-zinc-900">
                    {product.metrics.totalCarts}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 p-3 rounded-xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <FiCheck size={18} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block truncate">
                    Units Sold
                  </span>
                  <span className="text-base font-black text-zinc-900">
                    {product.metrics.totalPurchases}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 p-3 rounded-xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                  <FiTrendingUp size={18} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block truncate">
                    Checkout Rate
                  </span>
                  <span className="text-base font-black text-zinc-900">
                    {product.metrics.conversionRate}
                  </span>
                </div>
              </div>
            </div>

            {/* Selected Color Stock Breakdown Panel */}
            <div className="bg-white border border-zinc-100 p-4 rounded-2xl shadow-sm flex-1 flex flex-col justify-between min-h-[220px] lg:min-h-0">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-zinc-100 pb-2">
                  <h2 className="text-xs font-black text-zinc-900 tracking-tight uppercase flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-zinc-400 block"
                      style={{ backgroundColor: activeColorKey }}
                    />
                    Stock Breakdown: <span className="text-orange-500">{selectedAnalyticsColor}</span>
                  </h2>
                  <span className="text-[10px] font-bold uppercase text-zinc-400">
                    {activeColorSizes.length} Size Variant(s)
                  </span>
                </div>

                {activeColorSizes.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic py-4">
                    No sizes mapped for this color. Select another color above.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    {activeColorSizes.map((sz) => {
                      const stockVal = Number(colorSizesObj[sz] || 0);
                      const key = `${activeColorKey}___${sz}`;
                      const cartVal = product.analytics?.cartStats?.[key] || 0;
                      const revVal = product.analytics?.revenueStats?.[key] || 0;

                      return (
                        <div
                          key={sz}
                          className="bg-zinc-50 border border-zinc-200/80 p-3 rounded-xl flex flex-col justify-between space-y-2"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black uppercase text-zinc-900">
                              Size {sz}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                stockVal > 0
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {stockVal} left
                            </span>
                          </div>

                          <div className="space-y-1 text-[10px] text-zinc-500 pt-1 border-t border-zinc-200/60">
                            <div className="flex justify-between">
                              <span>In Carts:</span>
                              <span className="font-bold text-zinc-800">{cartVal}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Revenue:</span>
                              <span className="font-bold text-orange-600">${revVal.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Context Banner */}
              <div className="bg-zinc-900 text-white rounded-xl p-3 grid grid-cols-2 text-center mt-3">
                <div>
                  <span className="text-[9px] text-zinc-400 font-bold uppercase block tracking-wider">
                    Total Product Stock
                  </span>
                  <span className="text-sm font-black text-white">{product.stock} Units</span>
                </div>
                <div className="border-l border-zinc-800">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase block tracking-wider">
                    Catalog Base Price
                  </span>
                  <span className="text-sm font-black text-orange-400">${product.price.toFixed(2)}</span>
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