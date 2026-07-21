"use client";

import React, { Suspense, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  FiUser,
  FiMail,
  FiDollarSign,
  FiShoppingBag,
  FiTruck,
  FiStar,
  FiClock,
  FiArrowRight,
  FiShield,
  FiLoader,
  FiBell,
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

const fetcher = (url) => fetch(url).then((res) => res.json());

function ProfileContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const rawName = user?.name || user?.customerName || user?.displayName || user?.email?.split("@")[0] || "Jersey Fan";
  const firstName = rawName.split(" ")[0];

  const { data: analytics, isLoading: analyticsLoading } = useSWR(
    user?.id ? `/api/profile?userId=${user.id}` : null,
    fetcher
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth?mode=signin");
    }
  }, [user, authLoading, router]);

  if (authLoading || analyticsLoading) {
    return <ProfileFallback name={firstName} />;
  }

  const {
    totalOrders = 0,
    totalSpent = 0,
    activeOrdersCount = 0,
    mostOrderedItem = null,
    recentOrders = [],
  } = analytics || {};

  return (
    <div className="min-h-screen bg-gray-50 text-zinc-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HERO USER CARD */}
        <div className="bg-[#111827] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 text-center sm:text-left z-10">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-black text-3xl shadow-lg shrink-0">
              {firstName.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-orange-400">
                <FiShield size={12} /> Official Member
              </div>
              <h1 className="text-2xl sm:text-3xl font-black italic tracking-wide">
                {rawName}
              </h1>
              <p className="text-gray-400 text-xs flex items-center justify-center sm:justify-start gap-1.5">
                <FiMail size={14} className="text-orange-500" /> {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 z-10 w-full sm:w-auto">
            <Link
              href="/notifications"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-3 rounded-xl transition border border-white/10"
            >
              <FiBell size={16} /> Alerts
            </Link>
            <Link
              href="/orders"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-lg shadow-orange-500/20"
            >
              My Orders <FiArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* KEY METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-orange-50 text-orange-500 rounded-2xl shrink-0">
              <FiDollarSign size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Total Amount Spent
              </p>
              <h3 className="text-2xl font-black text-zinc-950 mt-0.5">
                ${totalSpent.toFixed(2)}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-blue-50 text-blue-500 rounded-2xl shrink-0">
              <FiShoppingBag size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Completed Orders
              </p>
              <h3 className="text-2xl font-black text-zinc-950 mt-0.5">
                {totalOrders} {totalOrders === 1 ? "Order" : "Orders"}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 text-emerald-500 rounded-2xl shrink-0">
              <FiTruck size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Active Shipments
              </p>
              <h3 className="text-2xl font-black text-zinc-950 mt-0.5">
                {activeOrdersCount} {activeOrdersCount === 1 ? "Package" : "Packages"}
              </h3>
            </div>
          </div>
        </div>

        {/* MOST ORDERED KIT & RECENT ORDERS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                  <FiStar className="text-orange-500" /> Most Ordered Kit
                </h3>
                <span className="text-[10px] font-black uppercase text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full">
                  #1 Favorite
                </span>
              </div>

              {mostOrderedItem ? (
                <div className="pt-6 text-center space-y-4">
                  <div className="relative w-36 h-36 mx-auto bg-gray-50 rounded-2xl border border-gray-100 p-3 flex items-center justify-center">
                    <Image
                      src={mostOrderedItem.image}
                      alt={mostOrderedItem.name}
                      fill
                      className="object-contain p-2 drop-shadow-md"
                    />
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-black text-base text-zinc-900 line-clamp-1">
                      {mostOrderedItem.name}
                    </h4>
                    <p className="text-xs font-semibold text-gray-500">
                      Purchased <span className="text-orange-500 font-bold">{mostOrderedItem.quantity} times</span> ({`$${mostOrderedItem.totalSpentOnItem.toFixed(2)} total`})
                    </p>
                  </div>
                </div>
              ) : (
                <div className="pt-12 pb-8 text-center space-y-2">
                  <p className="text-xs text-gray-400">
                    No kit orders recorded yet. Place your first order to discover your favorite kit!
                  </p>
                  <Link
                    href="/products"
                    className="inline-block text-xs font-bold text-orange-500 hover:underline pt-2"
                  >
                    Browse Collections &rarr;
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 text-center text-xs text-gray-500 border border-gray-100">
              ⚽ Authentic kit customization active on all future drops.
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                <FiClock className="text-orange-500" /> Recent Activity
              </h3>
              <Link
                href="/orders"
                className="text-xs font-bold text-orange-500 hover:underline"
              >
                View All Orders &rarr;
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400 space-y-2">
                <p>No recent orders found on your account.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 flex items-center justify-between gap-4 transition"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-zinc-900">
                          #{order.id}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            order.status === "Delivered"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        {new Date(order.date || Date.now()).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-sm text-zinc-900 block">
                        ${Number(order.totalAmount || 0).toFixed(2)}
                      </span>
                      <Link
                        href="/orders"
                        className="text-[10px] font-bold text-orange-500 hover:underline"
                      >
                        Track &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

function ProfileFallback({ name = "Profile" }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
      <FiLoader className="animate-spin text-orange-500" size={32} />
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
        Loading {name}...
      </p>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileFallback />}>
      <ProfileContent />
    </Suspense>
  );
}