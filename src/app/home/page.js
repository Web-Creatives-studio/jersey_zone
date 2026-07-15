import ProductsList from "../components/frontend/ProductsList";
import Hero from "../components/frontend/Hero";
import Featured from "../components/frontend/Featured";
import Showcase from "../components/frontend/ShowCase";
import CarouselCard from "../components/frontend/CarouselCard";

export const metadata = {
  title: "Home",
  description: "Welcome to our store",
};

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Featured />
      <Showcase />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <ProductsList params="home" />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <CarouselCard params="home" />
      </div>


    </div>
  );
}
