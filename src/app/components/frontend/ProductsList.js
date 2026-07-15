"use client";

import React, { useEffect, useState } from "react";
import Category from "./Category";
import Link from "next/link";
import ProductCard from "./ProductCard";
import Filter from "./Filter";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());
export default function ProductsList({ category, params }) {
  //const [products, setProducts] = useState([]);
  //const [loading, setLoading] = useState(true);

    const {
    data: prod = [],
    error,
    isLoading,
    mutate,
  } = useSWR("/api/products", fetcher, {
    refreshInterval: 4000,
    revalidateOnFocus: true,
  });


const products = prod.products
console.log(products)


  {/*useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");

        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await res.json();
        setProducts(data.products);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);*/}

  return (
    <div className="w-full">
      {params === "products" &&(
           <Category />
      )}
   

      {params === "products" && <Filter />}

      {isLoading ? (
        <div className="text-center py-10">Loading products...</div>
      ) : (
        <div className="div">
          {params === "home" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 py-2">
              {products.slice(0, 4).map((product) => (
                <ProductCard key={product.id} products={product} />
              ))}
            </div>
          ): (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 py-8">
            {products.map((product) => (
              <ProductCard key={product.id} products={product} />
            ))}
          </div>
          )}
         
        </div>
      )}

      {params === "home" && (
        <Link
          href={category ? `/products?category=${category}` : "/products"}
          className="text-sm text-gray-500 hover:text-gray-700 flex justify-end mt-4"
        >
          View All Products
        </Link>
      )}
    </div>
  );
}
