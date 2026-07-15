import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Hero Height */}
      <div className="relative h-[70vh] min-h-[500px] max-h-[850px] sm:h-[75vh] lg:h-[85vh]">
        {/* Background */}
        <Image
          src="/image.png"
          alt="Hero Banner"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="max-w-xl xl:max-w-2xl text-white">
              <span className="inline-block text-orange-500 uppercase tracking-[0.3em] text-xs sm:text-sm md:text-base font-semibold">
                New Season • New Dreams
              </span>

              <h1 className="mt-4 font-black leading-[0.95] text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                WEAR YOUR
                <br />
                <span className="text-orange-500">PASSION</span>
              </h1>

              <p className="mt-6 max-w-lg text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed">
                Premium football jerseys for true fans. Discover official club
                and national team kits designed for comfort, style, and
                match-day pride.
              </p>

              {/* Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <button className="bg-orange-500 hover:bg-orange-600 transition px-8 py-4 rounded-lg font-semibold cursor-pointer">
                    Shop Now
                  </button>
                </Link>

                <Link href="/home/#explore">
                  <button className="border border-white hover:bg-white hover:text-black transition px-8 py-4 rounded-lg font-semibold cursor-pointer">
                    Explore Collection
                  </button>
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 flex flex-wrap gap-8">
                <div>
                  <h3 className="text-2xl font-bold">500+</h3>
                  <p className="text-gray-300 text-sm">Jerseys</p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold">100+</h3>
                  <p className="text-gray-300 text-sm">Clubs</p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold">Worldwide</h3>
                  <p className="text-gray-300 text-sm">Shipping</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
