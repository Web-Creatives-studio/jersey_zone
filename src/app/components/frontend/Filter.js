"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

function FilterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentSort = searchParams.get("sort") || "newest";

  const handleFilter = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

    router.push(targetUrl, { scroll: false });
  };

  return (
    <div className="flex items-center justify-end gap-2 text-xs sm:text-sm text-gray-500 my-6">
      <span className="font-semibold text-zinc-700">Sort by:</span>
      <select
        name="sort"
        id="sort"
        value={currentSort}
        onChange={(e) => handleFilter(e.target.value)}
        className="ring-1 ring-gray-200 shadow-sm px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="asc">Price: Low to High</option>
        <option value="desc">Price: High to Low</option>
      </select>
    </div>
  );
}

export default function Filter() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-end gap-2 my-6">
          <div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      }
    >
      <FilterContent />
    </Suspense>
  );
}