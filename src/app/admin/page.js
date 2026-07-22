"use client";

import React, { Suspense } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useRouter } from "next/navigation";
import { FiLoader } from "react-icons/fi";
import useSWR from "swr";
import { useState } from "react";

export const dynamic = "force-dynamic";

const fetcher = (url) => fetch(url).then((res) => res.json());

function AdminDashboardContent() {
  const router = useRouter();
    const [warningPage, setWarningPage] = useState(1);
  const warningsPerPage = 2; // Items per page on desktop

  // Fetch live analytics from Neon PostgreSQL
  const { data, error, isLoading } = useSWR("/api/analytics", fetcher, {
    refreshInterval: 6000,
    revalidateOnFocus: true,
  });

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-center">
        <div className="bg-red-50 border border-red-100 text-red-700 font-bold p-6 rounded-xl shadow-sm max-w-md">
          CRITICAL: Database Synchronization Error. Check connection strings.
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return <LoadingPlaceholder />;
  }

  const {
    stats = {
      totalRevenue: "$0.00",
      activeCarts: 0,
      abandonedCarts: 0,
      totalOrders: 0,
      awaitingShipment: 0,
      processing: 0,
      lowStockWarnings: 0,
    },
    lowStockProducts = [],
    revenueTrend = [],
    conversionData = [],
    topProducts = [],
  } = data;



  return (
    <div className="min-h-screen w-full flex flex-col gap-4 text-[#111827] bg-slate-50/50 p-6 lg:p-8 select-none">
      {/* ROW 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* BLOCK 1: Gross Revenue Trends */}
        <div className="col-span-1 md:col-span-2 rounded-xl shadow-sm border border-slate-100 bg-white p-5 flex flex-col justify-between min-h-[300px] lg:h-[44vh]">
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Overview
              </span>
              <h2 className="text-xl font-bold text-[#111827]">
                Gross Revenue Trends
              </h2>
            </div>
            <div className="text-left md:text-right">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#111827]">
                {stats.totalRevenue}
              </h1>
              <p className="text-xs text-orange-500 font-medium">
                ↑ Live tracking
              </p>
            </div>
          </div>

          <div className="w-full h-48 md:h-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueTrend}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111827" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#111827"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BLOCK 2: Live Cart Activity */}
        <div className="col-span-1 rounded-xl shadow-sm border border-orange-100 bg-white p-5 flex flex-col justify-between border-t-4 border-t-orange-500 min-h-[250px] lg:h-[44vh]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
              Live Activity
            </span>
            <h2 className="text-lg font-bold mt-1 text-[#111827]">
              Shopping Carts
            </h2>
          </div>
          <div className="space-y-3 my-4">
            <div className="flex justify-between items-center bg-orange-50 p-3 rounded-lg">
              <span className="text-sm font-semibold text-orange-700">
                Active Sessions
              </span>
              <span className="text-xl font-black text-orange-600">
                {stats.activeCarts}
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
              <span className="text-sm font-semibold text-[#111827]">
                Abandoned Carts
              </span>
              <span className="text-xl font-black text-slate-600">
                {stats.abandonedCarts}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Cart recovery systems active.
          </p>
        </div>

        {/* BLOCK 3: Fulfillment Queue */}
        <div className="col-span-1 rounded-xl shadow-sm border border-slate-100 bg-white p-5 flex flex-col justify-between border-t-4 border-t-[#111827] min-h-[250px] lg:h-[44vh]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              To Do
            </span>
            <h2 className="text-lg font-bold mt-1 text-[#111827]">
              Fulfillment
            </h2>
          </div>
          <div className="space-y-3 my-4 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Awaiting Shipment</span>
              <span className="font-bold text-orange-500">
                {stats.awaitingShipment} orders
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Processing</span>
              <span className="font-bold text-[#111827]">
                {stats.processing} orders
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Low Stock Warnings</span>
              <span className="font-bold text-orange-500">
                {stats.lowStockWarnings} variant(s)
              </span>
            </div>
          </div>
          <button
            onClick={() => router.push(`/admin/orders`, { scroll: false })}
            className="w-full py-2 bg-[#111827] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            View All Orders
          </button>
        </div>
      </div>

      {/* ROW 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* BLOCK 4: Inventory Warnings Per Color & Per Size */}
      {/* BLOCK 4: Inventory Warnings Per Color & Per Size */}
{(() => {
  const totalWarningPages = Math.ceil(lowStockProducts.length / warningsPerPage) || 1;
  const desktopPaginatedWarnings = lowStockProducts.slice(
    (warningPage - 1) * warningsPerPage,
    warningPage * warningsPerPage
  );

  return (
    <div className="col-span-1 rounded-xl shadow-sm border border-slate-100 bg-white p-5 flex flex-col justify-between min-h-[220px] lg:h-[44vh]">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Stock Warnings
          </span>

          {/* DESKTOP-ONLY PAGINATION CONTROLS */}
          {lowStockProducts.length > warningsPerPage && (
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
              <span>
                {warningPage}/{totalWarningPages}
              </span>
              <div className="flex gap-0.5">
                <button
                  type="button"
                  disabled={warningPage === 1}
                  onClick={() => setWarningPage((p) => Math.max(p - 1, 1))}
                  className="px-1.5 py-0.5 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer disabled:cursor-not-allowed"
                >
                  ‹
                </button>
                <button
                  type="button"
                  disabled={warningPage >= totalWarningPages}
                  onClick={() => setWarningPage((p) => Math.min(p + 1, totalWarningPages))}
                  className="px-1.5 py-0.5 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer disabled:cursor-not-allowed"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>

        <h2 className="text-lg font-bold text-[#111827] mb-3">
          Variant Low Stock
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[260px] lg:max-h-none">
        {lowStockProducts.length > 0 ? (
          <>
            {/* 📱 MOBILE & TABLET VIEW: Renders ALL Items */}
            <div className="block lg:hidden space-y-3">
              {lowStockProducts.map((item, index) => {
                const percentage = Math.min((item.stock / 5) * 100, 100);
                return (
                  <div key={`mob-${index}`} className="p-2 bg-orange-50/50 border border-orange-100 rounded-lg">
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-zinc-900 truncate max-w-[140px]">
                        {item.name}
                      </span>
                      <span className="text-orange-600 shrink-0 font-black">
                        {item.stock} left
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mb-1.5">
                      <span className="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                        Color: {item.color}
                      </span>
                      <span className="bg-zinc-800 text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                        Size: {item.size}
                      </span>
                    </div>

                    <div className="h-1.5 w-full bg-orange-200/60 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className="h-full bg-orange-500 transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 💻 DESKTOP VIEW: Renders Paginated Items */}
            <div className="hidden lg:block space-y-3">
              {desktopPaginatedWarnings.map((item, index) => {
                const percentage = Math.min((item.stock / 5) * 100, 100);
                return (
                  <div key={`desk-${index}`} className="p-2.5 bg-orange-50/50 border border-orange-100 rounded-lg">
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-zinc-900 truncate max-w-[130px]">
                        {item.name}
                      </span>
                      <span className="text-orange-600 shrink-0 font-black">
                        {item.stock} left
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mb-1.5">
                      <span className="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                        Color: {item.color}
                      </span>
                      <span className="bg-zinc-800 text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                        Size: {item.size}
                      </span>
                    </div>

                    <div className="h-1.5 w-full bg-orange-200/60 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className="h-full bg-orange-500 transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-xs text-emerald-600 font-bold bg-emerald-50 rounded-xl p-3">
            ✓ All color & size variants healthy
          </div>
        )}
      </div>
    </div>
  );
})()}

        {/* BLOCK 5: Conversion Analytics */}
        <div className="col-span-1 md:col-span-2 rounded-xl shadow-sm border border-slate-100 bg-white p-5 flex flex-col justify-between min-h-[300px] lg:h-[44vh]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Conversion Analytics
            </span>
            <h2 className="text-lg font-bold text-[#111827]">
              Carts vs. Final Orders
            </h2>
          </div>
          <div className="w-full h-48 md:h-full mt-4">
            {conversionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={conversionData}
                  margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <Tooltip cursor={{ fill: "#f8fafc" }} />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "11px" }}
                  />
                  <Bar
                    dataKey="carts"
                    name="Added to Cart"
                    fill="#f97316"
                    radius={[4, 4, 0, 0]}
                    barSize={16}
                  />
                  <Bar
                    dataKey="orders"
                    name="Purchased"
                    fill="#111827"
                    radius={[4, 4, 0, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No conversion data registered yet.
              </div>
            )}
          </div>
        </div>

        {/* BLOCK 6: Top Products Leaderboard */}
        <div className="col-span-1 rounded-xl shadow-sm border border-slate-100 bg-white p-5 flex flex-col min-h-[250px] lg:h-[44vh]">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Leaderboard
          </span>
          <h2 className="text-lg font-bold mt-1 mb-3 text-[#111827]">
            Top Products
          </h2>
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[220px]">
            {topProducts.length > 0 ? (
              topProducts.map((product, i) => (
                <div
                  key={product.id || i}
                  onClick={() => router.push(`/admin/products/${product.id}`)}
                  className="flex justify-between items-center p-2 rounded-lg hover:bg-orange-50/40 border border-transparent hover:border-orange-100 transition-all text-xs cursor-pointer"
                >
                  <div className="truncate pr-2">
                    <p className="font-bold text-slate-800 truncate">
                      {product.name}
                    </p>
                    <p className="text-slate-400">
                      {product.sales} sold · {product.stock} total stock
                    </p>
                  </div>
                  <span className="font-black text-orange-600 shrink-0">
                    {product.revenue}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No sales recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingPlaceholder() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50 gap-3">
      <FiLoader className="animate-spin text-[#111827]" size={28} />
      <p className="text-slate-400 font-medium text-xs uppercase tracking-widest">
        Syncing Control Center Analytics...
      </p>
    </div>
  );
}

export default function Admin() {
  return (
    <Suspense fallback={<LoadingPlaceholder />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
