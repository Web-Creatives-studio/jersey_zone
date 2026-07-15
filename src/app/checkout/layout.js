"use client";
import ".././globals.css";
import Footer from "../components/frontend/Footer";
import { ToastContainer } from "react-toastify";
import Header from "../components/frontend/Header";
import UserChat from "../components/frontend/UserChat";
import {AuthProvider} from "../contexts/AuthContext";

export default function CheckOutLayout({ children }) {
  return (
    <>
      <main>
        <AuthProvider>
          <Header />

          {children}
          <ToastContainer position="bottom-right" theme="dark" />

          <Footer />

          <ToastContainer position="bottom-right" />
        </AuthProvider>
      </main>

      <UserChat />
    </>
  );
}
