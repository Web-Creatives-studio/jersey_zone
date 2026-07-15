"use client";

import {
  FaTruck,
  FaMoneyBillWave,
  FaHeadset,
  FaUndoAlt,
} from "react-icons/fa";

const features = [
  {
    icon: <FaTruck />,
    title: "Free Shipping",
    description: "On orders over $100",
  },
  {
    icon: <FaMoneyBillWave />,
    title: "Secure Payment",
    description: "100% safe transactions",
  },
  {
    icon: <FaHeadset />,
    title: "24/7 Support",
    description: "We're always here to help",
  },
  {
    icon: <FaUndoAlt />,
    title: "Easy Returns",
    description: "14-day money back guarantee",
  },
];

export default function Features() {
  return (
    <section className="bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {features.map((item, index) => (
            <div
              key={index}
              className="
                group
                flex items-center gap-4
                rounded-2xl
                border border-gray-100
                bg-white
                p-5
                shadow-sm
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-lg
              "
            >
              <div
                className="
                  flex h-14 w-14 shrink-0 items-center justify-center
                  rounded-full
                  bg-orange-100
                  text-2xl
                  text-orange-500
                  transition-colors
                  duration-300
                  group-hover:bg-orange-500
                  group-hover:text-white
                "
              >
                {item.icon}
              </div>

              <div className="min-w-0">
                <h3 className="text-sm md:text-base font-semibold uppercase text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}