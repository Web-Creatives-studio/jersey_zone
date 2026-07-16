"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import useSWR, { useSWRConfig } from "swr"; // 👈 Imported SWR Hooks
import { toast } from "react-toastify";
import EditProduct from "../../components/admin/EditProduct";
import DeleteProduct from "../../components/admin/DeletProduct";
import ProductTable from "../../components/admin/ProductTable";
import FooterInteract from "../../components/admin/FooterInteract";
import { FiLoader } from "react-icons/fi";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FaTrash } from "react-icons/fa";

// Force dynamic execution for safe database/API query environments during build time
export const dynamic = "force-dynamic";

// 1. Simple, clean fetcher helper function
const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch products catalog pipeline.");
  return res.json();
};

function ProductPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { mutate } = useSWRConfig(); // 👈 Access global cache revalidation tool

  const [editProduct, setEditProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColors, setSelectedColors] = useState({});
  const [openMenu, setOpenMenu] = useState(null);

  // Deletion States
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // 2. SWR Core Hook Setup with a 4-second background refresh interval
  const { data, error, isLoading } = useSWR("/api/products", fetcher, {
    refreshInterval: 4000, // ⏰ Auto-polls the backend API every 4 seconds for real-time tracking
    revalidateOnFocus: true, // Re-syncs instantly whenever the admin refocuses the window/tab
  });

  // Extract products array safely from SWR data payload
  const products = useMemo(() => data?.products || [], [data]);

  // Handle locking body layout scrolling when Modal overlays mount
  useEffect(() => {
    document.body.style.overflowY = editProduct ? "hidden" : "auto";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [editProduct]);

  // 3. Dynamically initialize default fallback variant color selections as items arrive
  useEffect(() => {
    if (products.length > 0) {
      setSelectedColors((prev) => {
        const updatedColors = { ...prev };
        products.forEach((product) => {
          if (product.colors && product.colors.length > 0 && !updatedColors[product.id]) {
            updatedColors[product.id] = product.colors[0];
          }
        });
        return updatedColors;
      });
    }
  }, [products]);

  const handleColorChange = (productId, color) => {
    setSelectedColors((prev) => ({
      ...prev,
      [productId]: color,
    }));
  };

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const page = Number(searchParams.get("page")) || 1;
  const itemsPerPage = 5;

  const createQueryString = (name, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, String(value));
    } else {
      params.delete(name);
    }
    if (name !== "page") {
      params.set("page", "1");
    }
    return params.toString();
  };

  const handleUrlParamChange = (name, value) => {
    const queryString = createQueryString(name, value);
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !category || product.category?.toLowerCase() === category.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProductsSlice = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const startEntryNumber = totalItems === 0 ? 0 : indexOfFirstItem + 1;
  const endEntryNumber = Math.min(indexOfLastItem, totalItems);

  const openDeleteModal = (target) => {
    setProductToDelete(target);
    setOpenMenu(null);
  };

  const closeDeleteModal = () => {
    setProductToDelete(null);
    setIsDeleting(false);
  };

  const handleExecuteDelete = async () => {
    if (!productToDelete) return;
    try {
      setIsDeleting(true);
      let targetUrl = "/api/products";

      if (productToDelete === "bulk") {
        targetUrl += `?ids=${selectedIds.join(",")}`;
      } else {
        targetUrl += `?id=${productToDelete.id}`;
      }

      const res = await fetch(targetUrl, { method: "DELETE" });
      const responseData = await res.json();

      if (!res.ok) throw new Error(responseData.message || "Failed to complete deletion.");

      toast.success(responseData.message || "Deletion executed successfully.");
      setSelectedIds([]);
      
      // 4. Force SWR to instantly re-fetch data across your app without waiting for the next polling interval
      mutate("/api/products");
    } catch (error) {
      console.error("Deletion execution crash:", error);
      toast.error(error.message || "An error occurred during removal.");
    } finally {
      closeDeleteModal();
    }
  };

  // Handle display of errors captured by the SWR wrapper pipeline hook
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 font-medium text-sm p-4 rounded-xl shadow-sm max-w-md text-center">
          Failed to synchronize products dashboard cache pipeline. Please check connection.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingPlaceholder />;
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 p-2 sm:p-4 md:p-6 lg:p-4 text-zinc-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col h-full md:flex-row md:items-center md:justify-between gap-6 mb-4">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
              PRODUCTS <span className="text-orange-500">DASHBOARD</span>{" "}
              <span>({products.length})</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1 font-medium">
              Manage products, inventories, and track active sales listings in real time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => handleUrlParamChange("search", e.target.value)}
              className="w-full sm:w-64 border border-zinc-200 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-zinc-900"
            />

            <select
              value={category}
              onChange={(e) => handleUrlParamChange("category", e.target.value)}
              className="border border-zinc-200 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-zinc-700 font-medium"
            >
              <option value="">All Categories</option>
              <option value="premier-league">Premier League</option>
              <option value="la-liga">La Liga</option>
              <option value="serie-a">Serie A</option>
              <option value="bundesliga">Bundesliga</option>
              <option value="national-teams">National Teams</option>
              <option value="training-kits">Training Kits</option>
              <option value="retro">Retro Jerseys</option>
            </select>
          </div>
        </div>

        <div className="h-10 flex justify-end mb-3">
          {selectedIds.length > 0 && (
            <button
              onClick={() => openDeleteModal("bulk")}
              className="flex gap-2 px-4 py-2 items-center justify-center bg-red-500 hover:bg-red-600 transition-colors duration-200 cursor-pointer rounded-xl text-xs font-bold text-white shadow-md"
            >
              <FaTrash size={12} />
              Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>

        <div className="overflow-x-auto w-full border border-slate-100 rounded-lg">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-y-auto max-h-[45vh] xl:max-h-[75vh] pr-1">
              <ProductTable
                currentProductsSlice={currentProductsSlice}
                selectedColors={selectedColors}
                handleColorChange={handleColorChange}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                setSelectedProduct={setSelectedProduct}
                setEditProduct={setEditProduct}
                openDeleteModal={openDeleteModal}
                router={router}
              />
            </div>
          </div>
        </div>

        <FooterInteract
          startEntryNumber={startEntryNumber}
          endEntryNumber={endEntryNumber}
          setCurrentPage={(pageNumber) => handleUrlParamChange("page", pageNumber)}
          createQueryString={createQueryString}
          page={page}
          router={router}
          pathname={pathname}
          totalItems={totalItems}
          totalPages={totalPages}
        />
      </div>

      {editProduct && selectedProduct && (
        <EditProduct
          initialProduct={selectedProduct}
          setEditProduct={setEditProduct}
          // 5. Instantly refresh cache when a product edit form saves successfully
          onUpdateSuccess={() => mutate("/api/products")} 
        />
      )}

      {productToDelete && (
        <DeleteProduct
          isDeleting={isDeleting}
          handleExecuteDelete={handleExecuteDelete}
          productToDelete={productToDelete}
          selectedRows={selectedIds}
          closeDeleteModal={closeDeleteModal}
        />
      )}
    </div>
  );
}

// Extracted Loading View
function LoadingPlaceholder() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 gap-3">
      <FiLoader className="animate-spin text-orange-500" size={28} />
      <p className="text-zinc-500 font-medium text-xs uppercase tracking-widest">
        Loading real-time listings...
      </p>
    </div>
  );
}

// 🌟 Default entry export wrapped safely in Suspense
export default function ProductPage() {
  return (
    <Suspense fallback={<LoadingPlaceholder />}>
      <ProductPageContent />
    </Suspense>
  );
}