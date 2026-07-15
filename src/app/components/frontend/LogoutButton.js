"use client";

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext"; // 👈 Import your global auth hook
import { FaSignOutAlt } from "react-icons/fa";
import { FiLoader } from "react-icons/fi";

export default function LogoutButton() {
  const { logout } = useAuth(); // 👈 Extract the logout controller handler
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = async () => {
    setIsLoggingOut(true);
    try {
      // Executes backend cookie clearing and updates global user application state to null
      await logout(); 
    } catch (error) {
      console.error("Logout click trigger crashed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogoutClick}
      disabled={isLoggingOut}
      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 active:bg-red-100 border border-transparent hover:border-red-200 transition-all rounded-xl cursor-pointer outline-none disabled:opacity-50"
      title="Securely Sign Out"
    >
      {isLoggingOut ? (
        <FiLoader className="animate-spin text-red-600" size={16} />
      ) : (
        <FaSignOutAlt size={16} />
      )}
      <span>{isLoggingOut ? "Signing Out..." : "Logout"}</span>
    </button>
  );
}