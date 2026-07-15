"use client";
import React from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";
import { useRouter } from "next/navigation";

const mockRevenueTrend = [
  { day: "Mon", revenue: 2100 }, { day: "Tue", revenue: 3400 },
  { day: "Wed", revenue: 2900 }, { day: "Thu", revenue: 4200 },
  { day: "Fri", revenue: 3800 }, { day: "Sat", revenue: 5100 },
  { day: "Sun", revenue: 4830 },
];

const mockConversionData = [
  { name: "Tottenham", carts: 45, orders: 28 },
  { name: "Arsenal", carts: 32, orders: 19 },
  { name: "Chelsea", carts: 24, orders: 11 },
];

const mockStats = { totalRevenue: "$24,530.00", activeCarts: 42, abandonedCarts: 18, totalOrders: 156 };
const mockTopProducts = [
  { name: "Tottenham Home Jersey", sales: 48, stock: 12, revenue: "$2,400" },
  { name: "Arsenal Away Kit", sales: 32, stock: 4, revenue: "$1,600" },
  { name: "Chelsea Third Shirt", sales: 19, stock: 25, revenue: "$950" },
];

export default function Admin() {
  const router = useRouter();
  return (
    // Changed h-[94vh] to min-h-screen and overflow-y-auto for fluid scrolling on small screens
    <div className="min-h-screen w-full flex flex-col gap-4 text-[#111827] bg-slate-50/50 p-8">
      
      {/* ROW 1: Switched to 1 column on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* BLOCK 1: Sales Performance Summary (Span 2 on large screens) */}
        <div className="col-span-1 md:col-span-2 rounded-xl shadow-sm border border-slate-100 bg-white p-5 flex flex-col justify-between min-h-[300px] lg:h-[44vh]">
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overview</span>
              <h2 className="text-xl font-bold text-[#111827]">Gross Revenue Trends</h2>
            </div>
            <div className="text-left md:text-right">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#111827]">{mockStats.totalRevenue}</h1>
              <p className="text-xs text-orange-500 font-medium">↑ +14.2% weekly</p>
            </div>
          </div>
          
          <div className="w-full h-48 md:h-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRevenueTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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

        {/* BLOCK 2: Live Cart Activity Tracker */}
        <div className="col-span-1 rounded-xl shadow-sm border border-orange-100 bg-white p-5 flex flex-col justify-between border-t-4 border-t-orange-500 min-h-[250px] lg:h-[44vh]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">Live Activity</span>
            <h2 className="text-lg font-bold mt-1 text-[#111827]">Shopping Carts</h2>
          </div>
          <div className="space-y-3 my-4">
            <div className="flex justify-between items-center bg-orange-50 p-3 rounded-lg">
              <span className="text-sm font-semibold text-orange-700">Active Sessions</span>
              <span className="text-xl font-black text-orange-600">{mockStats.activeCarts}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
              <span className="text-sm font-semibold text-[#111827]">Abandoned Carts</span>
              <span className="text-xl font-black text-slate-600">{mockStats.abandonedCarts}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">Cart recovery systems active.</p>
        </div>

        {/* BLOCK 3: Fulfillment Queue */}
        <div className="col-span-1 rounded-xl shadow-sm border border-slate-100 bg-white p-5 flex flex-col justify-between border-t-4 border-t-[#111827] min-h-[250px] lg:h-[44vh]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">To Do</span>
            <h2 className="text-lg font-bold mt-1 text-[#111827]">Fulfillment</h2>
          </div>
          <div className="space-y-3 my-4 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Awaiting Shipment</span>
              <span className="font-bold text-orange-500">8 orders</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Processing</span>
              <span className="font-bold text-[#111827]">3 orders</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Low Stock Alerts</span>
              <span className="font-bold text-orange-500">2 warnings</span>
            </div>
          </div>
          <button  onClick={() =>
                        router.push(`/admin/orders`, {
                          scroll: false,
                        })
                      } className="w-full py-2 bg-[#111827] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors">
            View All Orders
          </button>
        </div>
      </div>

      {/* ROW 2: Layout automatically scales fluidly across device breakpoints */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* BLOCK 4: Inventory / Low Stock Alert */}
        <div className="col-span-1 rounded-xl shadow-sm border border-slate-100 bg-white p-5 flex flex-col min-h-[220px] lg:h-[44vh]">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Stock Warnings</span>
          <h2 className="text-lg font-bold mt-1 mb-4 text-[#111827]">Stock Status</h2>
          <div className="flex-1 flex flex-col justify-center space-y-4">
            <div>
              <div className="flex mb-1 items-center justify-between text-xs font-bold">
                <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded">Tottenham (L)</span>
                <span className="text-orange-600">1 left</span>
              </div>
              <div className="h-1.5 w-full bg-orange-100 rounded-full overflow-hidden">
                <div style={{ width: "8%" }} className="h-full bg-orange-500"></div>
              </div>
            </div>
            <div>
              <div className="flex mb-1 items-center justify-between text-xs font-bold">
                <span className="text-[#111827] bg-slate-100 px-2 py-0.5 rounded">Arsenal (M)</span>
                <span className="text-[#111827]">4 left</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div style={{ width: "35%" }} className="h-full bg-[#111827]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* BLOCK 5: Conversion Analytics Bar Chart */}
        <div className="col-span-1 md:col-span-2 rounded-xl shadow-sm border border-slate-100 bg-white p-5 flex flex-col justify-between min-h-[300px] lg:h-[44vh]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Conversion Analytics</span>
            <h2 className="text-lg font-bold text-[#111827]">Carts vs. Final Orders</h2>
          </div>
          <div className="w-full h-48 md:h-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockConversionData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="carts" name="Added to Cart" fill="#f97316" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="orders" name="Purchased" fill="#111827" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BLOCK 6: Top Selling Products Leaderboard */}
        <div className="col-span-1 rounded-xl shadow-sm border border-slate-100 bg-white p-5 flex flex-col min-h-[250px] lg:h-[44vh]">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Leaderboard</span>
          <h2 className="text-lg font-bold mt-1 mb-3 text-[#111827]">Top Products</h2>
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[220px]">
            {mockTopProducts.map((product, i) => (
              <div key={i} className="flex justify-between items-center p-2 rounded-lg hover:bg-orange-50/40 border border-transparent hover:border-orange-100 transition-all text-xs">
                <div className="truncate pr-2">
                  <p className="font-bold text-slate-700 truncate">{product.name}</p>
                  <p className="text-slate-400">{product.sales} sales · {product.stock} left</p>
                </div>
                <span className="font-black text-orange-600 shrink-0">{product.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}