"use client";

import Image from "next/image";
import Link from "next/link";

export default function ShowCase() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8 lg:py-12" id="explore">
      <div
        className="
          grid gap-4
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-7
          lg:grid-rows-4
          lg:h-[650px]
        "
      >
        {/* FEATURED: Real Madrid */}
        <Link
          href="/products?category=la-liga" // Or replace with specific product ID: /products/real-madrid-home
          className="relative overflow-hidden rounded-3xl bg-black min-h-[450px] sm:min-h-[500px] lg:min-h-0 lg:col-span-2 lg:row-span-4 group cursor-pointer block"
        >
          <Image
            src="/real.jpg"
            alt="Real Madrid Jersey"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-cover group-hover:scale-105 transition duration-500"
            priority
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

          <div className="absolute bottom-8 left-6 right-6 text-white z-10">
            <span className="text-orange-500 uppercase tracking-[0.2em] text-xs font-semibold">
              New Season
            </span>

            <h2 className="mt-3 text-3xl md:text-4xl font-bold leading-tight">
              Real Madrid
              <br />
              Home Kit
            </h2>

            <p className="mt-3 text-gray-300 text-sm">
              Official 2025/26 Jersey Collection
            </p>

            <span className="inline-block mt-6 bg-orange-500 hover:bg-orange-600 transition px-6 py-3 rounded-full font-semibold text-sm">
              Shop Now
            </span>
          </div>
        </Link>

        {/* TOP CENTER: Barcelona */}
        <Link
          href="/products?category=la-liga" // Or replace with specific product ID
          className="relative overflow-hidden rounded-3xl bg-orange-500 min-h-[260px] lg:min-h-0 lg:col-span-3 lg:row-span-2 group cursor-pointer block"
        >
          <Image
            src="/barcelona.jpg"
            alt="Barcelona"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 550px"
            className="object-contain p-5 rounded-2xl group-hover:scale-105 transition duration-500"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

          <div className="absolute left-6 top-6 text-white max-w-[55%] z-10">
            <span className="uppercase text-xs tracking-[0.2em]">
              New Arrival
            </span>

            <h3 className="mt-2 text-2xl md:text-3xl font-bold">
              Barcelona
              <br />
              Home Kit
            </h3>

            <p className="mt-2 text-sm font-medium text-orange-200">
              Starting from $89
            </p>
          </div>
        </Link>

        {/* TOP RIGHT: Man City */}
        <Link
          href="/products?category=premier-league" // Or replace with specific product ID
          className="relative overflow-hidden rounded-3xl bg-white border min-h-[260px] lg:min-h-0 lg:col-span-2 lg:row-span-2 group cursor-pointer block hover:border-orange-500 transition-colors"
        >
          <Image
            src="/manchester.jpg"
            alt="Manchester City"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-contain p-6 group-hover:scale-105 transition duration-500"
          />

          <div className="absolute bottom-5 left-5 z-10">
            <p className="text-orange-500 font-semibold text-xs uppercase tracking-wider">
              Champions
            </p>

            <h3 className="text-2xl font-bold mt-1 text-zinc-900">
              Man City
            </h3>
          </div>
        </Link>

        {/* BOTTOM LEFT: Arsenal */}
        <Link
          href="/products?category=premier-league" // Or replace with specific product ID
          className="relative overflow-hidden rounded-3xl bg-white border min-h-[260px] lg:min-h-0 lg:col-span-2 lg:row-span-2 group cursor-pointer block hover:border-orange-500 transition-colors"
        >
          <Image
            src="/arsenal.jpg"
            alt="Arsenal"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-contain p-6 group-hover:scale-105 transition duration-500"
          />

          <div className="absolute bottom-5 left-5 z-10">
            <p className="text-orange-500 uppercase tracking-wider text-xs font-semibold">
              Best Seller
            </p>

            <h3 className="text-2xl font-bold mt-1 text-zinc-900">
              Arsenal Kit
            </h3>
          </div>
        </Link>

        {/* BOTTOM RIGHT: Liverpool */}
        <Link
          href="/products?category=premier-league" // Or replace with specific product ID
          className="relative overflow-hidden rounded-3xl bg-black min-h-[260px] lg:min-h-0 lg:col-span-3 lg:row-span-2 group cursor-pointer block"
        >
          <Image
            src="/liverpool.jpg"
            alt="Liverpool"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 550px"
            className="object-contain object-right p-6 group-hover:scale-105 transition duration-500"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white z-10">
            <span className="text-orange-500 uppercase tracking-[0.2em] text-xs font-semibold">
              Fan Favourite
            </span>

            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Liverpool
              <br />
              Home Jersey
            </h2>

            <span className="inline-block mt-6 border border-orange-500 px-6 py-3 rounded-full group-hover:bg-orange-500 group-hover:text-white transition font-semibold text-sm">
              Explore
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}