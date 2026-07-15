"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const categories = [
  { name: "All", slug: "all" },
  { name: "Premier League", slug: "premier-league" },
  { name: "La Liga", slug: "la-liga" },
  { name: "Serie A", slug: "serie-a" },
  { name: "Bundesliga", slug: "bundesliga" },
  { name: "National Teams", slug: "national-teams" },
  { name: "Training Kits", slug: "training-kits" },
  { name: "Retro Jerseys", slug: "retro" },
];

export default function Category() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get("category") || "all";

  const handleCategory = (category) => {
    const params = new URLSearchParams(searchParams);

    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    router.push(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <section className="relative w-full py-2">

      {/* Left Fade */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-white to-transparent" />

      {/* Right Fade */}
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent" />

      <div
        className="
          flex
          items-center
          gap-3
          overflow-x-auto
          snap-x
          snap-mandatory
          scroll-smooth
          scrollbar-hide
          px-1
          py-2
        "
      >
        {categories.map((category) => {
          const active = selectedCategory === category.slug;

          return (
            <button
              key={category.slug}
              onClick={() => handleCategory(category.slug)}
              className={`
                snap-start
                shrink-0
                whitespace-nowrap
                rounded-full
                border
                px-5
                py-3
                sm:px-6
                sm:py-3
                text-sm
                sm:text-base
                font-semibold
                transition-all
                duration-300
                active:scale-95

                ${
                  active
                    ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200"
                    : "bg-white border-gray-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
                }
              `}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}