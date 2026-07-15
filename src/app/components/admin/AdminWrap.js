"use client";

import React, { useState } from "react";
import AdminNavBar from "./AdminNavBar";

export default function AdminWrap({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Sidebar navigation component */}
      <AdminNavBar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main
        className={`
          flex-1 
          h-full 
          overflow-y-auto 
          px-4 md:px-6 lg:px-8 
          pt-20 lg:pt-0
        
          transition-all duration-300 ease-in-out
          ${collapsed ? "lg:pl-20" : "lg:pl-64"}
        `}
      >
        {children}
      </main>
    </div>
  );
}
