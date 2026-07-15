"use client";

import { useState } from "react";
import useSWR from "swr";
import { FiLoader } from "react-icons/fi";
import ShowOrder from "../../components/admin/ShowOrder";
import OrderTable from "../../components/admin/OrderTable";
import FooterInteract from "../../components/admin/FooterInteract";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Orders() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Single Source of Truth from URL parameters
  const category = searchParams.get("category") || "All";
  const page = Number(searchParams.get("page")) || 1;
  const selectedOrderId = searchParams.get("orderId") || "";

  const [updating, setUpdating] = useState(false);
  const [itemPage, setItemPage] = useState(1);
  const itemsPerPageSide = 2;
  const itemsPerPage = 7;

  const {
    data: orders = [],
    error,
    isLoading,
    mutate,
  } = useSWR("/api/orders", fetcher, {
    refreshInterval: 4000,
    revalidateOnFocus: true,
  });

  // 2. Centralized, reusable method to generate parameter strings safely
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

  const handleFulfillmentUpdate = async (orderId, currentStatus) => {
    let nextStatus = "Shipped";
    if (currentStatus === "Shipped") nextStatus = "Delivered";

    try {
      setUpdating(true);

      const response = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: nextStatus }),
      });

      if (!response.ok) throw new Error("Could not update fulfillment state");

      mutate();
    } catch (error) {
      console.error("Fulfillment update crash:", error);
      alert("Error synchronizing fulfillment status change.");
    } finally {
      setUpdating(false);
    }
  };

  // 3. Array filter maps driven entirely out of the URL parameter state
  const filteredOrders =
    category === "All"
      ? orders
      : orders.filter((o) => o.status?.toLowerCase() === category.toLowerCase());

  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrdersSlice = filteredOrders.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const startEntryNumber = totalItems === 0 ? 0 : indexOfFirstItem + 1;
  const endEntryNumber = Math.min(indexOfLastItem, totalItems);

  // Synchronized item selection finder
  const selectedOrder =
    orders.find((o) => String(o.id) === String(selectedOrderId)) || currentOrdersSlice[0];

  if (isLoading) {
    return (
      <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-3 text-slate-400">
        <FiLoader className="animate-spin text-[#111827]" size={28} />
        <p className="text-xs font-bold uppercase tracking-widest">
          Establishing live sync feed...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen xl:h-[94vh] grid grid-cols-1 xl:grid-cols-3 gap-4 text-[#111827] bg-white p-6 select-none">
      {/* LEFT COLUMN: ORDERS LIST & FILTERS */}
      <div className="order-2 xl:order-1 xl:col-span-2 rounded-xl shadow-lg border border-slate-100 bg-white p-4 sm:p-6 flex flex-col justify-between h-full overflow-hidden">
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />{" "}
                  Real-time Feed
                </span>
                <h1 className="text-2xl font-black tracking-tight">
                  Orders <span>({orders.length})</span>
                </h1>
              </div>

              {/* Custom Tab Filters */}
              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg text-xs font-bold w-full sm:w-auto overflow-x-auto whitespace-nowrap">
                {[
                  "All",
                  "Pending",
                  "Processing",
                  "Shipped",
                  "Delivered",
                  "Cancelled",
                ].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleUrlParamChange("category", status)}
                    className={`px-3 py-1.5 rounded-md transition-all flex-1 sm:flex-initial text-center cursor-pointer ${
                      category === status
                        ? "bg-[#111827] text-white shadow-sm"
                        : "text-slate-500 hover:text-[#111827]"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table Container */}
            <div className="overflow-x-auto w-full border border-slate-100 rounded-lg">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-y-auto max-h-[45vh] xl:max-h-[75vh] pr-1">
                  <OrderTable
                    setSelectedOrderId={(id) => handleUrlParamChange("orderId", id)}
                    currentOrdersSlice={currentOrdersSlice}
                    setItemPage={setItemPage}
                    selectedOrder={selectedOrder}
                  />
                </div>
              </div>
            </div>
          </div>

          <FooterInteract
            startEntryNumber={startEntryNumber}
            endEntryNumber={endEntryNumber}
            setCurrentPage={(pageNumber) => handleUrlParamChange("page", pageNumber)}
            createQueryString={createQueryString}
            router={router}
            pathname={pathname}
            page={page}
            totalItems={totalItems}
            totalPages={totalPages}
          />
        </div>
      </div>

      {/* RIGHT COLUMN: DETAILED SNAPSHOT VIEW */}
      <div className="order-1 xl:order-2 xl:col-span-1 rounded-xl shadow-lg border border-slate-100 bg-white p-4 sm:p-6 flex flex-col justify-between h-full border-t-4 border-t-[#111827] overflow-y-hidden">
        {selectedOrder ? (
          <ShowOrder
            selectedOrder={selectedOrder}
            itemPage={itemPage}
            itemsPerPageSide={itemsPerPageSide}
            setItemPage={setItemPage}
            updating={updating}
            handleFulfillmentUpdate={handleFulfillmentUpdate}
          />
        ) : (
          <div className="h-full min-h-50 flex items-center justify-center text-slate-400 text-sm font-medium">
            Select an order to view live details snapshot
          </div>
        )}
      </div>
    </div>
  );
}