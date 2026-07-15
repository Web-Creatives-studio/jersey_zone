"use client";

import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#111827] text-gray-300 ">
      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-3xl font-extrabold tracking-wide text-white italic capitalize"
            >
              Jersey<span className="text-orange-500">Zone</span>
            </Link>

            <p className="mt-5 text-sm leading-7 text-gray-400">
              Your trusted destination for authentic football jerseys,
              retro kits, training wear and official club merchandise.
            </p>

            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-500 transition flex items-center justify-center"
              >
                <FaFacebookF />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-500 transition flex items-center justify-center"
              >
                <FaInstagram />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-500 transition flex items-center justify-center"
              >
                <FaTwitter />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-500 transition flex items-center justify-center"
              >
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">
              Shop
            </h3>

            <div className="flex flex-col gap-3">
              <Link href="/products" className="hover:text-orange-500 transition">
                All Jerseys
              </Link>

              <Link href="/products?category=premier-league" className="hover:text-orange-500 transition">
                Premier League
              </Link>

              <Link href="/products?category=la-liga" className="hover:text-orange-500 transition">
                La Liga
              </Link>

              <Link href="/products?category=retro" className="hover:text-orange-500 transition">
                Retro Jerseys
              </Link>

              <Link href="/products?category=training-kits" className="hover:text-orange-500 transition">
                Training Kits
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">
              Company
            </h3>

            <div className="flex flex-col gap-3">
              <Link href="/about" className="hover:text-orange-500 transition">
                About Us
              </Link>

              <Link href="/contact" className="hover:text-orange-500 transition">
                Contact
              </Link>

              <Link href="/faq" className="hover:text-orange-500 transition">
                FAQs
              </Link>

              <Link href="/terms" className="hover:text-orange-500 transition">
                Terms & Conditions
              </Link>

              <Link href="/privacy" className="hover:text-orange-500 transition">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">
              Newsletter
            </h3>

            <p className="text-sm text-gray-400 mb-5">
              Subscribe to receive exclusive offers, new arrivals and
              football jersey updates.
            </p>

            <form className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 outline-none focus:border-orange-500"
              />

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 transition rounded-lg py-3 font-semibold text-white"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">

          <p>
            © {new Date().getFullYear()} JerseyZone. All rights reserved.
          </p>

          <div className="flex gap-6">
            <Link href="/shipping" className="hover:text-orange-500">
              Shipping
            </Link>

            <Link href="/returns" className="hover:text-orange-500">
              Returns
            </Link>

            <Link href="/support" className="hover:text-orange-500">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}