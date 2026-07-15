"use client";

import Image from "next/image";
import ProductInteraction from "../../components/frontend/ProductInteraction";
import { useParams,  useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";



export default function ProductsPage() {
  const params = useParams();
  const searchParams = useSearchParams(); 
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchProductDetails() {
    if (!params?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/products/${params.id}`);

      if (!response.ok) {
        throw new Error("Product data not found");
      }

      const dbResponse = await response.json();
      console.log("Fetched Product:", dbResponse);

    
      setProduct(dbResponse); 
      
    } catch (error) {
      console.error("Database fetch failed:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }

  fetchProductDetails();
}, [params?.id]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-500">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-800 font-medium">
        Product not found.
      </div>
    );
  }

 
  const sizeQuery = searchParams.get("size");
  const colorQuery = searchParams.get("color");

  const selectedColor = colorQuery || (product.colors && product.colors[0]);
  const selectedSize = sizeQuery || (product.sizes && product.sizes[selectedColor]?.[0]);

  return (
    <section className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-20">
          
          {/* IMAGE SECTION */}
          <div className="w-full lg:sticky lg:top-24 self-start">
            <div className="bg-white border border-orange-100 rounded-3xl shadow-xl overflow-hidden">
              <div className="relative aspect-square md:aspect-[4/4]">
                {product.images && selectedColor && product.images[selectedColor] ? (
                  <Image
                    src={product.images[selectedColor]}
                    alt={product.name || "Product Image"}
                    fill
                    sizes=""
                    priority
                    className="object-contain p-6 lg:p-10 transition-all duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
                    No variant image uploaded
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="rounded-xl border bg-orange-50 border-orange-100 p-4 text-center">
                <h3 className="text-orange-600 font-bold text-lg">100%</h3>
                <p className="text-sm text-gray-600">Quality</p>
              </div>
              <div className="rounded-xl border bg-orange-50 border-orange-100 p-4 text-center">
                <h3 className="text-orange-600 font-bold text-lg">Fast</h3>
                <p className="text-sm text-gray-600">Delivery</p>
              </div>
              <div className="rounded-xl border bg-orange-50 border-orange-100 p-4 text-center">
                <h3 className="text-orange-600 font-bold text-lg">Secure</h3>
                <p className="text-sm text-gray-600">Payment</p>
              </div>
            </div>
          </div>

          {/* DETAILS SECTION */}
          <div className="flex flex-col justify-start lg:sticky lg:top-24 h-fit">
            <span className="inline-flex w-fit bg-orange-100 text-orange-700 px-4 py-1 rounded-full text-sm font-semibold">
              Best Seller
            </span>

            <h1 className="text-3xl md:text-4xl xl:text-5xl font-extrabold text-black mt-4 leading-tight">
              {product.name}
            </h1>

            {product.subtitle && (
              <p className="text-zinc-500 font-medium text-sm mt-1">
                {product.subtitle}
              </p>
            )}

            <p className="text-gray-500 mt-4 text-base md:text-lg leading-8">
              {product.description ? product.description.slice(0, 120) + "..." : ""}
            </p>

            {/* PRICE */}
            <div className="flex items-center gap-4 mt-8">
              <h2 className="text-4xl md:text-5xl font-black text-orange-600">
                ${product.price}
              </h2>
              <span className="line-through text-gray-400 text-xl">$59.90</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                33% OFF
              </span>
            </div>

            <div className="h-px bg-gray-200 my-8"></div>

            <div>
              <h3 className="font-bold text-xl text-black mb-3">
                Product Description
              </h3>
              <p className="text-gray-600 leading-8">{product.description}</p>
            </div>

            <div className="my-10">
              <ProductInteraction
                product={product}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
              />
            </div>

            {/* EXTRA INFO */}
            <div className="border rounded-2xl p-6 bg-gray-50 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="font-semibold text-black">Free Nationwide</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Returns</span>
                <span className="font-semibold text-black">30 Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Availability</span>
                <span className="font-semibold text-green-600">
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}