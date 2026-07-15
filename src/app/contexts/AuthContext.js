"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

// Create the Context object
const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  logout: () => {},
  refreshSession: () => {},
});

// The Provider Component that wraps your app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  // Define the verification logic once
  const verifySession = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch to your secure session endpoint (cookies are automatically attached)
      const res = await fetch("/api/auth/me");

      if (!res.ok) {
        throw new Error("Session invalid or expired");
      }

      const data = await res.json();
      setUser(data.user); // Populate global user state
      setError(null);
    } catch (err) {
      console.error("Global session verification failure:", err.message);
      setUser(null); // Ensure user is logged out globally
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 1. Run verification on initial app mount
  useEffect(() => {
    verifySession();
  }, [verifySession]);

  // 2. Optional: Re-verify when navigating to sensitive routes (e.g., checkout, admin)
  useEffect(() => {
    const protectedRoutes = ["/checkout", "/carts"];
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      verifySession();
    }
  }, [pathname, verifySession]);

  const logout = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      setUser(null);
      router.push("/auth?message=logged_out");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // The context value exposed to consumers
  const value = {
    user,
    loading,
    error,
    logout,
    refreshSession: verifySession, // Allow manual refresh (e.g., after login)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for easy consumption in components
export const useAuth = () => useContext(AuthContext);