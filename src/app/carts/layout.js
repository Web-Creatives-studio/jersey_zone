"use client";
import ".././globals.css";
import Footer from "../components/frontend/Footer";
import { ToastContainer } from "react-toastify";
import Header from "../components/frontend/Header";
import UserChat from "../components/frontend/UserChat";
import { useEffect } from "react";
import useCartStore from "../stores/useCartStore";
import { AuthProvider } from "../contexts/AuthContext";

export default function CartLayout({ children }) {
  const fetchUserCart = useCartStore((state) => state.fetchUserCart);

  useEffect(() => {
    // Automatically reads from local storage userSession and populates state
    fetchUserCart();
  }, [fetchUserCart]);
  return (
    <>
      <AuthProvider>
        <main>
          <Header />
          {children}
          <Footer />

          <ToastContainer position="bottom-right" />
        </main>

        <UserChat />
      </AuthProvider>
    </>
  );
}
