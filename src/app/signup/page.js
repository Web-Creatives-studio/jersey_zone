"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUp() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Something went wrong");

      router.push("/signin"); // Redirect to sign in page upon success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-[#111827] px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black tracking-tight">Create Account</h1>
          <p className="text-sm text-gray-400 mt-1">Join us to finalize your orders quickly</p>
        </div>

        {error && <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg font-semibold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 transition-colors"
              placeholder="Alex Rivera"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 transition-colors"
              placeholder="alex@email.com"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 transition-colors"
              placeholder="••••••••"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#111827] hover:bg-orange-600 disabled:bg-gray-200 text-white font-bold py-3.5 rounded-xl transition-all tracking-wide cursor-pointer mt-2"
          >
            {loading ? "Registering account profile..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
          Already have an account? <Link href="/signin" className="text-orange-500 font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}