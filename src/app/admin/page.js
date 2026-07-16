"use client";

import React, { Suspense } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";
import { useRouter } from "next/navigation";
import { FiLoader } from "react-icons/fi";
import useSWR from "swr";

export const dynamic = "force-dynamic";

const fetcher = (url) => fetch(url).then((res) => res.json());

function AdminDashboardContent() {
  const router = useRouter();

  // Fetch all live analytics from Neon
  const { data, error, isLoading } = useSWR("/api/analytics", fetcher, {
    refreshInterval: 6000, // Refreshes stats in the background every 6 seconds
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

  // Loader Guard
  if (isLoading || !data) {
    return <LoadingPlaceholder />;
  }

  // Safely destructure with robust fallbacks
  const { 
    stats = { 
      totalRevenue: "$0.00", 
      activeCarts: 0, 
      abandonedCarts: 0, 
      totalOrders: 0,
      awaitingShipment: 0,
      processing: 0,
      lowStockWarnings: 0
    }, 
    lowStockProducts = [],
    revenueTrend = [], 
    conversionData = [], 
    topProducts = [] 
  } = data;

  return (
    <div className="min-h-screen w-full flex flex-col gap-4 text-[#111827] bg-slate-50/50 p-8">
      
      {/* ROW 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* BLOCK 1: Gross Revenue Trends (Live DB) */}
        <div className="col-span-1 md:col-span-2 rounded-xl shadow-sm border border-slate-100 bg-white p-5 flex flex-col justify-between min-h-[300px] lg:h-[44vh]">
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overview</span>
              <h2 className="text-xl font-bold text-[#111827]">Gross Revenue Trends</h2>
            </div>
            <div className="text-left md:text-right">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#111827]">{stats.totalRevenue}</h1>
              <p className="text-xs text-orange-500 font-medium">↑ Live tracking</p>
            </div>
          </div>
          
          <div className="w-full h-48 md:h-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111827" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#111827" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="revenue" stroke="#111827" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BLOCK 2: Live Cart Activity Tracker (Live DB) */}
        <div className="col-span-1 rounded-xl shadow-sm border border-orange-100 bg-white p-5 flex flex-col justify-between border-t-4 border-t-orange-500 min-h-[250px] lg:h-[44vh]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">Live Activity</span>
            <h2 className="text-lg font-bold mt-1 text-[#111827]">Shopping Carts</h2>
          </div>
          <div className="space-y-3 my-4">
            <div className="flex justify-between items-center bg-orange-50 p-3 rounded-lg">
              <span className="text-sm font-semibold text-orange-700">Active Sessions</span>
              <span className="text-xl font-black text-orange-600">{stats.activeCarts}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
              <span className="text-sm font-semibold text-[#111827]">Abandoned Carts</span>
              <span className="text-xl font-black text-slate-600">{stats.abandonedCarts}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">Cart recovery systems active.</p>
        </div>

        {/* BLOCK 3: Fulfillment Queue (Live DB) */}
        <div className="col-span-1 rounded-xl shadow-sm border border-slate-100 bg-white p-5 flex flex-col justify-between border-t-4 border-t-[#111827] min-h-[250px] lg:h-[44vh]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">To Do</span>
            <h2 className="text-lg font-bold mt-1 text-[#111827]">Fulfillment</h2>
          </div>
          <div className="space-y-3 my-4 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Awaiting Shipment</span>
              <span className="font-bold text-orange-500">{stats.awaitingShipment} orders</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Processing</span>
              <span className="font-bold text-[#111827]">{stats.processing} orders</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Low Stock Warnings</span>
              <span className="font-bold text-orange-500">{stats.lowStockWarnings} warnings</span>
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
        
        {/* BLOCK 4: Inventory Warnings (Live DB) */}
        <div className="col-span-1 rounded-xl shadow-sm border border-slate-100 bg-white p-5 flex flex-col min-h-[220px] lg:h-[44vh]">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Stock Warnings</span>
          <h2 className="text-lg font-bold mt-1 mb-4 text-[#111827]">Stock Status</h2>
          <div className="flex-1 flex flex-col justify-center space-y-4">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((prod, index) => {
                // Calculate percentage out of a healthy stock threshold of 15 units
                const percentage = Math.min((prod.stock / 15) * 100, 100);
                return (
                  <div key={index}>
                    <div className="flex mb-1 items-center justify-between text-xs font-bold">
                      <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded truncate max-w-[130px]">
                        {prod.name}
                      </span>
                      <span className="text-orange-600 shrink-0">{prod.stock} left</span>
                    </div>
                    <div className="h-1.5 w-full bg-orange-100 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${percentage}%` }} 
                        className="h-full bg-orange-500 transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-xs text-emerald-600 font-bold bg-emerald-50 rounded-xl p-3">
                ✓ All inventory items healthy
              </div>
            )}
          </div>
        </div>

        {/* BLOCK 5: Dynamic Conversion Analytics (Live DB) */}
        <div className="col-span-1 md:col-span-2 rounded-xl shadow-sm border border-slate-100 bg-white p-5 flex flex-col justify-between min-h-[300px] lg:h-[44vh]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Conversion Analytics</span>
            <h2 className="text-lg font-bold text-[#111827]">Carts vs. Final Orders</h2>
          </div>
          <div className="w-full h-48 md:h-full mt-4">
            {conversionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="carts" name="Added to Cart" fill="#f97316" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="orders" name="Purchased" fill="#111827" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No conversion data registered yet.
              </div>
            )}
          </div>
        </div>

        {/* BLOCK 6: Live Top Products Leaderboard (Live DB) */}
        <div className="col-span-1 rounded-xl shadow-sm border border-slate-100 bg-white p-5 flex flex-col min-h-[250px] lg:h-[44vh]">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Leaderboard</span>
          <h2 className="text-lg font-bold mt-1 mb-3 text-[#111827]">Top Products</h2>
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[220px]">
            {topProducts.length > 0 ? (
              topProducts.map((product, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded-lg hover:bg-orange-50/40 border border-transparent hover:border-orange-100 transition-all text-xs">
                  <div className="truncate pr-2">
                    <p className="font-bold text-slate-700 truncate">{product.name}</p>
                    <p className="text-slate-400">{product.sales} sales · {product.stock} left in stock</p>
                  </div>
                  <span className="font-black text-orange-600 shrink-0">{product.revenue}</span>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No orders recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

// Extracted Loading View
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

// Wrap the content inside a Suspense Boundary for production-safe deployment
export default function Admin() {
  return (
    <Suspense fallback={<LoadingPlaceholder />}>
      <AdminDashboardContent />
    </Suspense>
  );
}