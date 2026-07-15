import Image from "next/image";

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
        {/* Mobile: 100vw | Tablet: 50vw | Desktop: 2/7th of 1280px (~360px) */}
        <div className="relative overflow-hidden rounded-3xl bg-black min-h-[450px] sm:min-h-[500px] lg:min-h-0 lg:col-span-2 lg:row-span-4 group">
          <Image
            src="/real.jpg"
            alt="Real Madrid Jersey"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-cover group-hover:scale-105 transition duration-500"
            priority // Optional: Consider adding priority if this is above the fold
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

          <div className="absolute bottom-8 left-6 right-6 text-white">
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

            <button className="mt-6 bg-orange-500 hover:bg-orange-600 transition px-6 py-3 rounded-full font-semibold">
              Shop Now
            </button>
          </div>
        </div>

        {/* TOP CENTER: Barcelona */}
        {/* Mobile: 100vw | Tablet: 50vw | Desktop: 3/7th of 1280px (~550px) */}
        <div className="relative overflow-hidden rounded-3xl bg-orange-500 min-h-[260px] lg:min-h-0 lg:col-span-3 lg:row-span-2 group">
          <Image
            src="/barcelona.jpg"
            alt="Barcelona"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 550px"
            className="object-contain p-5 rounded-2xl group-hover:scale-105 transition duration-500"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

          <div className="absolute left-6 top-6 text-white max-w-[55%]">
            <span className="uppercase text-xs tracking-[0.2em]">
              New Arrival
            </span>

            <h3 className="mt-2 text-2xl md:text-3xl font-bold">
              Barcelona
              <br />
              Home Kit
            </h3>

            <p className="mt-2 text-sm">
              Starting from $89
            </p>
          </div>
        </div>

        {/* TOP RIGHT: Man City */}
        {/* Mobile: 100vw | Tablet: 50vw | Desktop: 2/7th of 1280px (~360px) */}
        <div className="relative overflow-hidden rounded-3xl bg-white border min-h-[260px] lg:min-h-0 lg:col-span-2 lg:row-span-2 group">
          <Image
            src="/.png"
            alt="Manchester City"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-contain p-6 group-hover:scale-105 transition duration-500"
          />

          <div className="absolute bottom-5 left-5">
            <p className="text-orange-500 font-semibold text-xs uppercase tracking-wider">
              Champions
            </p>

            <h3 className="text-2xl font-bold mt-1">
              Man City
            </h3>
          </div>
        </div>

        {/* BOTTOM LEFT: Arsenal */}
        {/* Mobile: 100vw | Tablet: 50vw | Desktop: 2/7th of 1280px (~360px) */}
        <div className="relative overflow-hidden rounded-3xl bg-white border min-h-[260px] lg:min-h-0 lg:col-span-2 lg:row-span-2 group">
          <Image
            src="/images/arsenal.png"
            alt="Arsenal"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-contain p-6 group-hover:scale-105 transition duration-500"
          />

          <div className="absolute bottom-5 left-5">
            <p className="text-orange-500 uppercase tracking-wider text-xs font-semibold">
              Best Seller
            </p>

            <h3 className="text-2xl font-bold mt-1">
              Arsenal Kit
            </h3>
          </div>
        </div>

        {/* BOTTOM RIGHT: Liverpool */}
        {/* Mobile: 100vw | Tablet: 50vw | Desktop: 3/7th of 1280px (~550px) */}
        <div className="relative overflow-hidden rounded-3xl bg-black min-h-[260px] lg:min-h-0 lg:col-span-3 lg:row-span-2 group">
          <Image
            src="/images/liverpool.png"
            alt="Liverpool"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 550px"
            className="object-contain object-right p-6 group-hover:scale-105 transition duration-500"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white">
            <span className="text-orange-500 uppercase tracking-[0.2em] text-xs font-semibold">
              Fan Favourite
            </span>

            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Liverpool
              <br />
              Home Jersey
            </h2>

            <button className="mt-6 border border-orange-500 px-6 py-3 rounded-full hover:bg-orange-500 hover:text-white transition">
              Explore
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}