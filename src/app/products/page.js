import React, { Suspense } from "react";
import ProductsList from "../components/frontend/ProductsList";
import { FiLoader } from "react-icons/fi";

// Force request-time serverless compilation to prevent static build failures
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Products",
  description: "Welcome to our Product page",
};

export default async function ProductsPage({ searchParams }) {
  // Properly await the asynchronous search parameters payload matching Next.js specifications
  const resolvedParams = await searchParams;
  const category = resolvedParams?.category || "";

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Protected by Suspense layout boundary to support query sorting transitions cleanly */}
      <Suspense fallback={<CatalogLoadingPlaceholder />}>
        <ProductsList params="products" category={category} />
      </Suspense>
    </div>
  );
}

// Extracted Clean Catalog Loading View
function CatalogLoadingPlaceholder() {
  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-2 text-zinc-400">
      <FiLoader className="animate-spin text-orange-500" size={26} />
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
        Filtering catalog collections...
      </p>
    </div>
  );
}