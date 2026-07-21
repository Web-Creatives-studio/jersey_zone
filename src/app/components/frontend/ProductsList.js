"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Category from "./Category";
import Link from "next/link";
import ProductCard from "./ProductCard";
import Filter from "./Filter";
import useSWR from "swr";
import { FiLoader } from "react-icons/fi";

const fetcher = (url) => fetch(url).then((res) => res.json());

function ProductsContent({ params }) {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const selectedSort = searchParams.get("sort") || "newest";

  // Build SWR API route with both query parameters
  const queryParams = new URLSearchParams();
  if (selectedCategory) queryParams.set("category", selectedCategory);
  if (selectedSort) queryParams.set("sort", selectedSort);

  const queryString = queryParams.toString();
  const apiUrl = queryString ? `/api/products?${queryString}` : "/api/products";

  const {
    data: prod,
    error,
    isLoading,
  } = useSWR(apiUrl, fetcher, {
    refreshInterval: 4000,
    revalidateOnFocus: true,
  });

  // Extract products array safely
  const rawProducts = Array.isArray(prod)
    ? prod
    : Array.isArray(prod?.products)
    ? prod.products
    : [];

  // 1. Category Filter
  let filteredProducts = selectedCategory
    ? rawProducts.filter((p) => {
        const cat = p.category?.toLowerCase() || "";
        const slugCat = cat.replace(/\s+/g, "-");
        return cat === selectedCategory.toLowerCase() || slugCat === selectedCategory.toLowerCase();
      })
    : [...rawProducts];

  // 2. Client-side Sort
  filteredProducts.sort((a, b) => {
    const priceA = Number(a.price || 0);
    const priceB = Number(b.price || 0);
    const dateA = new Date(a.createdAt || a.date || 0).getTime();
    const dateB = new Date(b.createdAt || b.date || 0).getTime();

    if (selectedSort === "asc") return priceA - priceB;
    if (selectedSort === "desc") return priceB - priceA;
    if (selectedSort === "oldest") return dateA - dateB;
    return dateB - dateA; // Default "newest"
  });

  const displayProducts = params === "home" ? filteredProducts.slice(0, 4) : filteredProducts;

  return (
    <div className="w-full">
      {params === "products" && <Category />}
      {params === "products" && <Filter />}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 py-8">
          {[...Array(params === "home" ? 4 : 8)].map((_, i) => (
            <div
              key={i}
              className="h-80 w-full rounded-2xl bg-gray-100 animate-pulse border border-gray-100"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-sm text-red-500 font-semibold">
          Failed to load products. Please refresh and try again.
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400 font-medium">
          No jerseys found in this selection.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 py-8">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} products={product} />
          ))}
        </div>
      )}

      {params === "home" && (
        <Link
          href="/products"
          className="text-xs font-bold uppercase tracking-wider text-orange-500 hover:text-orange-600 flex items-center justify-end gap-1 mt-2 transition"
        >
          View All Products &rarr;
        </Link>
      )}
    </div>
  );
}

function ProductsFallback() {
  return (
    <div className="w-full py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
      <FiLoader className="animate-spin text-orange-500" size={28} />
      <p className="text-xs font-bold uppercase tracking-widest">
        Loading Products...
      </p>
    </div>
  );
}

export default function ProductsList(props) {
  return (
    <Suspense fallback={<ProductsFallback />}>
      <ProductsContent {...props} />
    </Suspense>
  );
}