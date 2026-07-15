"use client";

import React, { useState, useEffect, Suspense } from "react";
import { FiPlus } from "react-icons/fi";
import CreateMarket from "../../components/admin/CreateMarket";
import AddProduct from "../../components/admin/AddProduct";
import MarketTable from "../../components/admin/MarketTable";
import FooterInteract from "../../components/admin/FooterInteract";
import ShowMail from "../../components/admin/ShowMail";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// Force dynamic execution for safe database/API query environments
export const dynamic = "force-dynamic";

function MarketingContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [automations, setAutomations] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [addProduct, setAddProduct] = useState(false);
  const [createMarket, setCreateMarket] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerPage = 7;

  // 1. Single Source of Truth driven straight from URL Parameter Array
  const page = Number(searchParams.get("page")) || 1;
  const urlMailId = searchParams.get("mailId") || "";

  // Fetch automations from Next.js Prisma API route
  useEffect(() => {
    async function fetchAutomations() {
      try {
        const res = await fetch("/api/marketing");
        if (res.ok) {
          const data = await res.json();
          setAutomations(data);
        }
      } catch (error) {
        console.error("Failed to load automation engine rules:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAutomations();
  }, [createMarket]);

  // 2. Centralized URL generation handler parameters mapper
  const createQueryString = (name, value) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(name, String(value));
    } else {
      params.delete(name);
    }

    // ONLY reset to page 1 if we are changing filters/search, NOT when selecting items!
    const isSelectingItem = name === "orderId" || name === "customerId" || name === "mailId";
    
    if (name !== "page" && !isSelectingItem) {
      params.set("page", "1");
    }

    return params.toString();
  };

  const handleUrlParamChange = (name, value) => {
    const queryString = createQueryString(name, value);
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };

  const filteredMail = automations.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalItems = filteredMail.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMailSlice = filteredMail.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const startEntryNumber = totalItems === 0 ? 0 : indexOfFirstItem + 1;
  const endEntryNumber = Math.min(indexOfLastItem, totalItems);

  // Synchronize targeted active element using strict string conversions
  const selectedMail =
    automations.find((c) => String(c.id) === String(urlMailId)) || currentMailSlice[0];

  return (
    <>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-3 gap-6 text-[#111827] bg-slate-50/50 p-6 select-none relative overflow-x-hidden">
        {/* LEFT COLUMN: AUTOMATION TABLE INDEX DIRECTORY */}
        <div className="col-span-1 lg:col-span-2 rounded-xl shadow-sm border border-slate-100 bg-white p-4 md:p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-zinc-900">
                  Email Automation Pipelines
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Configure event rules, status tags, and delivery delays.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
                <input
                  type="text"
                  placeholder="Search rules or topics..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleUrlParamChange("page", 1);
                  }}
                  className="w-full sm:w-64 px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-orange-500 text-slate-700 bg-slate-50/50"
                />
                <button
                  onClick={() => {
                    setCreateMarket(true);
                    setAddProduct(false);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-orange-600 text-white font-medium hover:bg-zinc-900 transition-all duration-200 cursor-pointer text-sm shadow-sm"
                >
                  <FiPlus size={20} />
                  New Flow
                </button>
              </div>
            </div>

            <div className="hidden md:block overflow-y-auto max-h-[68vh]">
              {isLoading ? (
                <div className="text-center py-12 text-sm text-slate-400">
                  Loading pipelines...
                </div>
              ) : (
                <MarketTable
                  currentMailSlice={currentMailSlice}
                  setSelectedMailId={(id) => handleUrlParamChange("mailId", id)}
                  selectedMail={selectedMail}
                />
              )}
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

        {/* RIGHT COLUMN: RUNTIME EMAIL PREVIEW SNAPSHOT */}
        <div className="rounded-xl shadow-sm border border-slate-100 bg-white p-4 sm:p-6 flex flex-col justify-between h-full border-t-4 border-t-zinc-900 overflow-y-auto">
          {selectedMail ? (
            <ShowMail selectedMail={selectedMail} />
          ) : (
            <div className="h-full min-h-[300px] flex items-center justify-center text-slate-400 text-sm font-medium">
              Select an entry to view runtime details snapshot
            </div>
          )}
        </div>
      </div>
      {addProduct && <AddProduct setAddProduct={setAddProduct} />}
      {createMarket && <CreateMarket setCreateMarket={setCreateMarket} />}
    </>
  );
}

// 2. Loading Placeholder during Suspense fallback
function LoadingPlaceholder() {
  return (
    <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-3 text-slate-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
        Loading Marketing Systems...
      </p>
    </div>
  );
}

// 🌟 3. Default export wrapping the content in a Suspense boundary
export default function MarketingPage() {
  return (
    <Suspense fallback={<LoadingPlaceholder />}>
      <MarketingContent />
    </Suspense>
  );
}