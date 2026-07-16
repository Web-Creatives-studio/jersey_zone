import React, { Suspense } from "react";
import ProductsList from "./components/frontend/ProductsList";
import Hero from "./components/frontend/Hero";
import Featured from "./components/frontend/Featured";
import Showcase from "./components/frontend/ShowCase";
import CarouselCard from "./components/frontend/CarouselCard";
import { FiLoader } from "react-icons/fi";
import Header from "./components/frontend/Header";
import Footer from "./components/frontend/Footer";
// Force request-time serverless page compilation
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Home",
  description: "Welcome to our store",
};

export default function HomePage() {

  return (
    <div>
      <Header/>
      {/* Static/Pure-presentational components render cleanly */}
      <Hero />
      <Featured />
      <Showcase />

      {/* 🌟 Dynamic Catalog Component protected by a Suspense boundary */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Suspense fallback={<ComponentLoader label="Loading fresh collections..." />}>
          <ProductsList params="home" />
        </Suspense>
      </div>
      
      {/*Carousel Slider subset protected by a Suspense boundary */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <Suspense fallback={<ComponentLoader label="Synchronizing product lists..." />}>
          <CarouselCard params="home" />
        </Suspense>
      </div>

      <Footer/>
    </div>
  );
}

// Extracted micro loading placeholder view for clean sub-layouts
function ComponentLoader({ label }) {
  return (
    <div className="w-full py-12 flex flex-col items-center justify-center gap-2 text-zinc-400">
      <FiLoader className="animate-spin text-orange-500" size={24} />
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
        {label}
      </p>
    </div>
  );
}