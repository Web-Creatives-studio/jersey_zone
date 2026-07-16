"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  logout: () => {},
  refreshSession: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  const verifySession = useCallback(async () => {
    try {
      // 🌟 Don't force loading state on silent updates to prevent UI blinking
      const res = await fetch("/api/auth/me");

      if (!res.ok) {
        throw new Error("Session invalid or expired");
      }

      const data = await res.json();
      setUser(data.user); 
      setError(null);
    } catch (err) {
      console.error("Global session verification failure:", err.message);
      setUser(null); 
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 1. Run verification on initial app mount
  useEffect(() => {
    verifySession();
  }, [verifySession]);

  // 2. 🌟 EVENT LISTENER TRIGGER: Watch for internal broadcast messages to reload the session instantly
  useEffect(() => {
    const handleSyncTrigger = () => {
      verifySession();
    };

    window.addEventListener("auth-session-sync", handleSyncTrigger);
    return () => window.removeEventListener("auth-session-sync", handleSyncTrigger);
  }, [verifySession]);

  // 3. Re-verify when navigating to sensitive routes
  useEffect(() => {
    const protectedRoutes = ["/checkout", "/carts", "/orders", "/profile"];
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      verifySession();
    }
  }, [pathname, verifySession]);

  const logout = async () => {
    try {
      setLoading(true);
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/auth?mode=signin&message=logged_out");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    logout,
    refreshSession: verifySession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);