"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import {
  FiMenu,
  FiLogOut,
  FiHome,
  FiBell,
  FiUsers,
  FiPlus,
  FiPackage,
  FiX,
  FiShoppingCart,
  FiTrendingUp,
  FiMessageSquare,
} from "react-icons/fi";

import AddProduct from "./AddProduct";
import CreateMarket from "./CreateMarket";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AdminNavBar({ collapsed, setCollapsed }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [addProduct, setAddProduct] = useState(false);
  const [createMarket, setCreateMarket] = useState(false);

  const pathname = usePathname();

  // Live real-time metric counters sync from your PostgreSQL database
  const {
    data: metrics = { products: 0, orders: 0, marketing: 0, notifications: 0 },
  } = useSWR("/api/navbar-stat", fetcher, { refreshInterval: 4000 });

  useEffect(() => {
    document.body.style.overflowY = addProduct ? "hidden" : "auto";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [addProduct]);

  const menuItems = [
    {
      title: "Dashboard",
      icon: <FiHome size={20} />,
      href: "/admin",
      badge: null,
    },
    {
      title: "Orders",
      icon: <FiShoppingCart size={20} />,
      href: "/admin/orders",
      badge: metrics.orders > 0 ? metrics.orders : null,
      badgeColor: "bg-orange-500 text-white",
    },
    {
      title: "Products",
      icon: <FiPackage size={20} />,
      href: "/admin/products",
      badge: metrics.products > 0 ? metrics.products : null,
      badgeColor: "bg-zinc-800 text-zinc-300 border border-zinc-700",
    },
    {
      title: "Customers",
      icon: <FiUsers size={20} />,
      href: "/admin/customers",
      badge: metrics.users > 0 ? metrics.users: null,
      badgeColor: "bg-zinc-800 text-zinc-300 border border-zinc-700",
    },
    {
      title: "Analytics",
      icon: <FiTrendingUp size={20} />,
      href: "/admin/analytics",
      badge: null,
    },
    {
      title: "Reviews",
      icon: <FiMessageSquare size={20} />,
      href: "/admin/reviews",
      badge: null,
    },
    {
      title: "Marketing",
      icon: <FiMessageSquare size={20} />,
      href: "/admin/marketing",
      badge: metrics.marketing > 0 ? metrics.marketing : null,
      badgeColor: "bg-emerald-600 text-white",
    },
    {
      title: "Notifications",
      icon: <FiBell size={20} />,
      href: "/admin/notifications",
      badge: metrics.notifications > 0 ? metrics.notifications : null,
      badgeColor: "bg-red-500 text-white animate-pulse",
    },
  ];

  return (
    <>
      {/* Mobile Sticky Header Bar with custom title branding alignment */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#111827] border-b border-zinc-800 px-4 flex items-center justify-between z-40">
        <button
          onClick={() => setMobileOpen(true)}
          className="bg-zinc-900 text-white p-2 rounded-lg shadow-md border border-zinc-800 hover:bg-orange-600 transition-colors"
        >
          <FiMenu size={20} />
        </button>
        <span className="text-sm font-black tracking-widest text-white uppercase bg-zinc-950 px-3 py-1.5 rounded-md border border-zinc-800 shadow-inner">
          ADMIN JERSEY ZONE
        </span>
        {/* Visual spacer maintaining clean header centering mechanics */}
        <div className="w-9" />
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-[#111827] text-white border-r border-zinc-800
          shadow-2xl z-50 flex flex-col justify-between
          transition-all duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${collapsed ? "lg:w-20" : "lg:w-64"}
          w-72
        `}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="h-16 px-4 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
            {!collapsed && (
              <h1 className="text-lg font-black tracking-wider text-white flex items-center gap-1.5">
                JERSEY<span className="text-orange-500">ZONE</span>
              </h1>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex p-2 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-orange-500 transition-colors"
              >
                <FiMenu size={20} />
              </button>

              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-orange-500"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            <div>
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={() => {
                        setAddProduct(false);
                        setCreateMarket(false);
                        setMobileOpen(false); // Auto-close mobile tray layout drawer on select
                      }}
                      className={`
                        flex items-center justify-between
                        px-3 py-3 rounded-xl
                        transition-all duration-200 group
                        ${
                          isActive
                            ? "bg-orange-500 text-white font-semibold shadow-md shadow-orange-500/20"
                            : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`${isActive ? "text-white" : "text-zinc-400 group-hover:text-orange-500"} transition-colors flex-shrink-0`}
                        >
                          {item.icon}
                        </span>

                        {(!collapsed || mobileOpen) && (
                          <span className="font-medium text-sm truncate">
                            {item.title}
                          </span>
                        )}
                      </div>

                      {/* Notification Count Pill Badges */}
                      {item.badge !== null && (!collapsed || mobileOpen) && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Component Tree */}
            <div>
              {(!collapsed || mobileOpen) && (
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-3 px-3">
                  Quick Actions
                </p>
              )}

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setAddProduct(true);
                    setCreateMarket(false);
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all duration-200 group cursor-pointer"
                >
                  <FiPlus
                    size={20}
                    className="text-zinc-400 group-hover:text-orange-500 flex-shrink-0"
                  />
                  {(!collapsed || mobileOpen) && (
                    <span className="font-medium text-sm">Add Product</span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setCreateMarket(true);
                    setAddProduct(false);
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all duration-200 group cursor-pointer"
                >
                  <FiPlus
                    size={20}
                    className="text-zinc-400 group-hover:text-orange-500 flex-shrink-0"
                  />
                  {(!collapsed || mobileOpen) && (
                    <span className="font-medium text-sm">Create Market</span>
                  )}
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Footer Area Wrapper */}
        <div className="p-4 border-t border-zinc-800 bg-[#111827]/50 flex-shrink-0">
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-400 hover:bg-red-950/30 hover:text-red-400 transition-all duration-200 cursor-pointer group">
            <FiLogOut
              size={20}
              className="text-zinc-400 group-hover:text-red-400 flex-shrink-0"
            />
            {(!collapsed || mobileOpen) && (
              <span className="font-medium text-sm">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Modals View Overlays */}
      {addProduct && <AddProduct setAddProduct={setAddProduct} />}
      {createMarket && <CreateMarket setCreateMarket={setCreateMarket} />}
    </>
  );
}
