"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { FaUserPlus, FaSignInAlt, FaTshirt } from "react-icons/fa";

export default function AuthPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const mode = searchParams.get("mode") || "signin";
  const isSignUpActive = mode === "signup";

  const [loading, setLoading] = useState(false);
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({ name: "", email: "", password: "" });

  const handleModeChange = (newMode) => {
    router.push(`${pathname}?mode=${newMode}`);
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Points exactly to your newly merged secure login route endpoint
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signInData),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Authentication failed");

      // 🔒 REMOVED LOCALSTORAGE: Session token is handled completely inside secure HttpOnly cookies now
      toast.success("Welcome back! Redirecting...");
      router.push("/home");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signUpData),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Registration failed");

      toast.success("Account created successfully! Please sign in.");
      handleModeChange("signin");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0b0f17] px-4 py-8"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(11, 15, 23, 0.85), rgba(17, 24, 39, 0.95)), url('authbg.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* MAIN CONTAINER WINDOW */}
      <div className="relative w-full max-w-4xl h-[620px] bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col md:flex-row">
        
        {/* PANEL A: SIGN IN FORM */}
        <div className={`w-full md:w-1/2 h-full p-8 flex flex-col justify-center bg-white transition-all duration-500 ${
          !isSignUpActive 
            ? "opacity-100 pointer-events-auto z-10" 
            : "opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto z-0"
        }`}>
          <div className="mb-6">
            <h2 className="text-3xl font-black tracking-tight text-gray-900">Welcome Back</h2>
            <p className="text-xs text-gray-400 font-medium mt-1">Access your account dashboard hub</p>
          </div>

          <form onSubmit={handleSignInSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-orange-500 bg-white text-gray-900 transition-colors"
                placeholder="alex@email.com"
                value={signInData.email}
                onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-orange-500 bg-white text-gray-900 transition-colors"
                placeholder="••••••••"
                value={signInData.password}
                onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#111827] hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl transition-all tracking-wide cursor-pointer flex items-center justify-center gap-2 mt-2 shadow-lg"
            >
              <FaSignInAlt size={14} /> {loading ? "Verifying Keys..." : "Sign In"}
            </button>
          </form>

          <button 
            type="button"
            onClick={() => handleModeChange("signup")}
            className="md:hidden mt-6 text-sm text-orange-500 font-bold hover:underline self-center"
          >
            Don't have an account? Sign Up
          </button>
        </div>

        {/* PANEL B: SIGN UP FORM */}
        <div className={`w-full md:w-1/2 h-full p-8 flex flex-col justify-center bg-white absolute md:relative top-0 left-0 w-full h-full transition-all duration-500 ${
          isSignUpActive 
            ? "opacity-100 pointer-events-auto z-10" 
            : "opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto z-0"
        }`}>
          <div className="mb-6">
            <h2 className="text-3xl font-black tracking-tight text-gray-900">Create Account</h2>
            <p className="text-xs text-gray-400 font-medium mt-1">Register to save product customization items</p>
          </div>

          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-orange-500 bg-white text-gray-900 transition-colors"
                placeholder="Alex Rivera"
                value={signUpData.name}
                onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-orange-500 bg-white text-gray-900 transition-colors"
                placeholder="alex@email.com"
                value={signUpData.email}
                onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-orange-500 bg-white text-gray-900 transition-colors"
                placeholder="••••••••"
                value={signUpData.password}
                onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#111827] hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl transition-all tracking-wide cursor-pointer flex items-center justify-center gap-2 mt-2 shadow-lg"
            >
              <FaUserPlus size={14} /> {loading ? "Creating Profile..." : "Sign Up"}
            </button>
          </form>

          <button 
            type="button"
            onClick={() => handleModeChange("signin")}
            className="md:hidden mt-6 text-sm text-orange-500 font-bold hover:underline self-center"
          >
            Already have an account? Sign In
          </button>
        </div>

        {/* DESKTOP SLIDING OVERLAY COVER PANEL */}
        <div 
          className={`hidden md:flex absolute top-0 left-0 w-1/2 h-full bg-[#111827] text-white flex-col items-center justify-center p-12 transition-transform duration-700 ease-in-out z-20 ${
            isSignUpActive ? "translate-x-0 rounded-r-[80px]" : "translate-x-full rounded-l-[80px]"
          }`}
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(17, 24, 39, 0.93), rgba(249, 115, 22, 0.15)), url('/products/1783043221254-T_Home.jpeg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner animate-bounce" style={{ animationDuration: '4s' }}>
              <FaTshirt className="text-orange-500 text-xl" />
            </div>

            {isSignUpActive ? (
              <>
                <h3 className="text-3xl font-black tracking-tight">Already Registered?</h3>
                <p className="text-xs text-gray-300 font-medium max-w-xs leading-relaxed">
                  Log back into your secure profile dashboard to complete pending orders or track deliveries.
                </p>
                <button
                  type="button"
                  onClick={() => handleModeChange("signin")}
                  className="px-8 py-2.5 rounded-xl border border-white/40 hover:border-orange-500 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer mt-4"
                >
                  Go to Sign In
                </button>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-black tracking-tight">New to the Club?</h3>
                <p className="text-xs text-gray-300 font-medium max-w-xs leading-relaxed">
                  Create an account profile today to build and customize premium team kits smoothly.
                </p>
                <button
                  type="button"
                  onClick={() => handleModeChange("signup")}
                  className="px-8 py-2.5 rounded-xl border border-white/40 hover:border-orange-500 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer mt-4"
                >
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}