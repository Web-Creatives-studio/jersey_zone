"use client";
import React from "react";
import Link from "next/link";
import { FaHome, FaShoppingCart } from "react-icons/fa";
import useCartStore from "../../stores/useCartStore";

export default function Navbar() {
  const { cart } = useCartStore();

  return (
    <nav>
  
      {/*Left */}
      <div className="grid grid-cols-3 items-center justify-center">
        <div className="div">
          <Link href="/">
            <h2 className="text-md font-medium tracking-wider">Logo</h2>
          </Link>
        </div>
        {/*Center */}
        <div className="">
          <input
            type="search"
            name=""
            id="search"
            className="border rounded-full h-10 lg:w-64 w-40 outline-0 px-4 py-1"
          />{" "}
        </div>
        {/*Right */}
        <div className=" hidden lg:flex gap-4">
          <Link href="/home">Home</Link>
          <Link href="/products">Products</Link>
          <Link href="/carts" className="relative">
            <FaShoppingCart className="text-gray-600" />
            <span className="absolute -top-3 -right-3 bg-amber-300 text-gary-300 rounded-full w-4 h-4 flex items-center justify-center text-xs font-medium">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </Link>
          <Link href="/">Sign In</Link>
        </div>

        <div className="lg:hidden flex justify-end">
          <FaHome className="text-gray-500 hover:text-gray-700 transition-all duration-300" />
        </div>
      </div>
    </nav>
  );
}
