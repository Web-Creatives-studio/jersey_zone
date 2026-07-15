"use client";

import Link from "next/link";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import useCartStore from "../../stores/useCartStore";
import { useAuth } from "../../contexts/AuthContext"; // 👈 Imported Auth Context
import {
  FaSearch,
  FaPhoneAlt,
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
  FaBell
} from "react-icons/fa";
import LogoutButton from "./LogoutButton";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const {cart} = useCartStore()

  // 1. Get current authenticated user details from global context
  const { user, loading } = useAuth();

  // 2. Real-Time Unread Notification Streaming (Only fetches if user is logged in)
  const { data: notifications = [] } = useSWR(
    user?.id ? `/api/notifications?customerId=${user.id}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  // 3. Real-Time Carts Cache Streaming (Only fetches if user is logged in)
  const { data: carts = [] } = useSWR(
    user?.id ?`/api/carts?customerId=${user?.id}&isOrdered=true` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  // 4. Calculate counters dynamically
  const unreadNotificationsCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.read).length
    : 0;

  const cartCount = Array.isArray(cart)
    ? cart.reduce((acc, item) => acc + item.quantity, 0)
    : 0;

  const navLinks = [
    { name: "Home", link: "/home" },
    { name: "Shop", link: "/products" },
    { name: "About", link: "/about" },
    { name: "Blog", link: "/blog" },
    { name: "Contact", link: "/contact" },
    { name: "Orders", link: "/orders" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 text-zinc-900">
      {/* ================= TOP BAR ================= */}
      <div className="bg-[#111827] text-white">
        <div className="max-w-7xl mx-auto h-16 lg:h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Desktop Search Bar */}
          <div className="hidden lg:flex items-center w-64 rounded-xl bg-white/10 overflow-hidden border border-white/10 focus-within:border-orange-500 transition-all">
            <input
              type="text"
              placeholder="Search jerseys..."
              className="flex-1 bg-transparent px-4 py-2.5 outline-none text-xs text-white placeholder:text-gray-400"
            />
            <button type="button" className="px-4 py-2.5 hover:bg-white/10 text-gray-300 transition cursor-pointer">
              <FaSearch size={12} />
            </button>
          </div>

          {/* Core Brand Identity Logo */}
          <Link href="/home" className="text-xl sm:text-2xl lg:text-3xl font-black italic tracking-wider hover:opacity-90 transition">
            <span>JERSEY</span>
            <span className="text-orange-500">ZONE</span>
          </Link>

          {/* Desktop Support Contact Bar info */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-bold tracking-wide text-gray-300">
            <FaPhoneAlt className="text-orange-500" />
            <span>+12 222 5456 888</span>
          </div>

          {/* Responsive Mobile Interface Trigger Bar */}
          <div className="flex lg:hidden items-center gap-1">
            <Link
              href="/carts"
              className="relative h-10 w-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition text-white"
              title="View Cart Storage"
            >
              <FaShoppingCart size={16} />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-black animate-scaleIn">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setOpen(!open)}
              type="button"
              className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition cursor-pointer text-white"
            >
              {open ? <FaTimes size={16} /> : <FaBars size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* ================= DESKTOP NAVIGATION BAR ================= */}
      <div className="bg-white hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            {/* Primary Page Link Elements */}
            <nav className="flex items-center gap-8">
              {navLinks.map((item) => {
                const isActive = item.link === "/home" 
                  ? pathname === "/home" 
                  : pathname.startsWith(item.link);

                return (
                  <Link
                    key={item.name}
                    href={item.link}
                    className={`text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                      isActive
                        ? "text-orange-500 border-b-2 border-orange-500 pb-1"
                        : "text-zinc-600 hover:text-orange-500"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Utility Action Buttons Panel */}
            <div className="flex items-center gap-2">
              <Link href="/profile" title="My Account Profile">
                <button type="button" className="cursor-pointer h-9 w-9 rounded-xl flex items-center justify-center hover:bg-orange-50 text-zinc-700 hover:text-orange-500 transition">
                  <FaUser size={14} />
                </button>
              </Link>

              <Link href="/carts" className="relative" title="Shopping Cart Layout">
                <button type="button" className="relative h-9 w-9 rounded-xl flex items-center justify-center hover:bg-orange-50 text-zinc-700 hover:text-orange-500 transition cursor-pointer">
                  <FaShoppingCart size={15} />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 bg-orange-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              </Link>

              <Link href="/notifications" className="relative" title="Notifications Hub">
                <button type="button" className="relative h-9 w-9 rounded-xl flex items-center justify-center hover:bg-orange-50 text-zinc-700 hover:text-orange-500 transition cursor-pointer">
                  <FaBell size={15} />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>
              </Link>

              <div className="pl-2 border-l border-gray-200 ml-1">
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RESPONSIVE MOBILE MENU INTERFACE OVERLAY ================= */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white ${open ? "max-h-screen opacity-100 border-b" : "max-h-0 opacity-0"}`}>
        <div className="px-4 py-5 space-y-5 shadow-inner">
          
          {/* Mobile Search Input */}
          <div className="flex items-center rounded-xl bg-gray-100 overflow-hidden border border-transparent focus-within:bg-white focus-within:border-orange-500 transition-all">
            <input
              type="text"
              placeholder="Search jerseys..."
              className="flex-1 bg-transparent px-4 py-2.5 text-xs outline-none text-zinc-800"
            />
            <button type="button" className="px-4 text-gray-500">
              <FaSearch size={12} />
            </button>
          </div>

          {/* Mobile Page Navigation Links */}
          <nav className="flex flex-col font-medium text-sm">
            {navLinks.map((item) => {
              const isActive = pathname === item.link;
              return (
                <Link
                  key={item.name}
                  href={item.link}
                  onClick={() => setOpen(false)}
                  className={`py-3 border-b border-gray-50 flex justify-between items-center ${
                    isActive ? "text-orange-500 font-bold" : "text-zinc-600"
                  }`}
                >
                  <span>{item.name}</span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Footer Utility Quick Access Group Grid */}
          <div className="pt-2 grid grid-cols-2 gap-4 text-xs font-bold">
            <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 text-zinc-700 hover:bg-orange-50 hover:text-orange-500 transition">
              <FaUser size={14} />
              <span>Profile Hub</span>
            </Link>

            <Link href="/carts" onClick={() => setOpen(false)} className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 text-zinc-700 hover:bg-orange-50 hover:text-orange-500 transition relative">
              <FaShoppingCart size={14} />
              <span>Cart ({cartCount})</span>
            </Link>

            <Link href="/notifications" onClick={() => setOpen(false)} className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 text-zinc-700 hover:bg-orange-50 hover:text-orange-500 transition relative">
              <FaBell size={14} />
              <span>Alerts ({unreadNotificationsCount})</span>
            </Link>

            <div className="flex items-center justify-center p-2 rounded-xl bg-red-50 text-red-600">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}