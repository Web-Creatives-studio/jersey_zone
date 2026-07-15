import React from "react";

import ProductsList from "../components/frontend/ProductsList";



export const metadata = {
  title: "Products",
  description: "Welcome to our Product page",
};



export default async function ProductsPage({ searchParams }) {
  
  const category = (await searchParams).category;


  return (
    <div className=" max-w-7xl mx-auto px-4 py-12">
      <ProductsList params="products" category={category}  />
    </div>
  );
}
