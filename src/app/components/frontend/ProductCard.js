"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useCartStore from "../../stores/useCartStore";
import { FaShoppingCart, FaMinus, FaPlus } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

export default function ProductCard({ products }) {
  const router = useRouter();
  
  const { user, loading } = useAuth(); 
  const [quantity, setQuantity] = useState(1);

  // 1. Establish default color fallback safely
  const defaultColor = products.colors?.[0] || "white";

  // 2. Extract initial size key from the stock map configuration object
  const initialSizes = products.sizes?.[defaultColor]
    ? Object.keys(products.sizes[defaultColor])
    : [];
  const defaultSize = initialSizes[0] || "M";

  const [productType, setProductType] = useState({
    color: defaultColor,
    size: defaultSize,
  });

  const { addToCart } = useCartStore();

  // 3. Extract maximum available stock limits reactively
  const currentVariantStockMap = products.sizes?.[productType.color] || {};
  const currentAvailableStock = currentVariantStockMap[productType.size] || 0;

  // 4. Update size selection to the first available key when a color changes
  const handleColorChange = (newColor) => {
    const availableSizeKeys = products.sizes?.[newColor]
      ? Object.keys(products.sizes[newColor])
      : [];
    const fallbackSize = availableSizeKeys[0] || "M";

    setProductType({
      color: newColor,
      size: fallbackSize,
    });

    setQuantity(1);
  };

  const handleSizeChange = (newSize) => {
    setProductType((prev) => ({ ...prev, size: newSize }));
    setQuantity(1); 
  };

  const handleAddToCart = () => {
    if (currentAvailableStock <= 0) {
      toast.error("This specific size and color variation is out of stock.");
      return;
    }

    const customerId = user?.id || null;
    const customerName = user?.name || null;
    const newCartItemId = "c" + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);



    addToCart(
      {
        id: newCartItemId,
        productId: products.id,
        name: products.name,
        price: products.price,
        images: products.images[productType.color],
        quantity: quantity,
        selectedSize: productType.size,
        selectedColor: productType.color,
      },
      customerId,
      customerName,
    );

    console.log(products.images[productType.color])

    toast.success(`${products.name} added to cart successfully!`);
  };

  const handleCheckout = () => {
    if (currentAvailableStock <= 0) {
      toast.error("This specific size and color variation is out of stock.");
      return;
    }

    const newCartItemId = "c" + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);



    // 🌟 THE FIX: Staged as a single-item array in "pending_checkout_items" to perfectly match CartDetails expectations
    const pendingCheckoutItem = {
      id: newCartItemId,
      productId: products.id,
      name: products.name,
      price: products.price,
      images: products.images[productType.color],
      quantity: quantity,
      selectedSize: productType.size,
      selectedColor: productType.color,
    };

    localStorage.setItem("pending_checkout_items", JSON.stringify([pendingCheckoutItem]));

    // Route dynamically to Step 2 (Shipping Address) of your unified carts page checkout sequence
    router.push(`/checkout`, { scroll: false });
  };

  const activeSizesList = products.sizes?.[productType.color]
    ? Object.keys(products.sizes[productType.color])
    : [];

  return (
    <div className="shadow-lg group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-orange-500 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between text-zinc-900">
      <div>
        <Link href={`/products/${products.id}`}>
          <div className="relative aspect-[3/3] w-full bg-gray-50 overflow-hidden rounded-xl">
            <Image
              src={products.images?.[productType.color] || "/placeholder.jpeg"}
              alt={products.name}
              fill
              sizes="(max-width: 640px) 40vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-all duration-500"
            />
          </div>
        </Link>

        <div className="flex flex-col gap-4 p-4">
          <div className="flex justify-between items-start">
            <Link
              href={`/products/${products.id}`}
              className="hover:text-orange-500 transition-colors max-w-[50%]"
            >
              <h2 className="text-lg font-bold tracking-tight text-gray-800 truncate">
                {products.name}
              </h2>
            </Link>

            <div className="flex items-baseline gap-2 flex-shrink-0">
              <span className="text-2xl font-black text-orange-500">
                ${products.price.toFixed(2)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                ${(products.price + 20).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-gray-100 pt-3">
            <div className="flex justify-between items-center">
              {/* COLORS SECTION */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Color Variant
                </span>
                <div className="flex gap-3 h-8 items-center">
                  {(products.colors || []).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      className={`w-6 h-6 rounded-full border transition-all relative cursor-pointer flex items-center justify-center ${
                        productType.color === color
                          ? "ring-2 ring-orange-500 ring-offset-2 scale-110"
                          : "border-gray-300 hover:scale-105"
                      }`}
                      title={color}
                    >
                      <div
                        className="w-full h-full rounded-full border border-black/10"
                        style={{ backgroundColor: color }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* QUANTITY SECTION */}
              {currentAvailableStock > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Available ({currentAvailableStock})
                  </span>

                  <div className="flex items-center w-fit bg-white border border-gray-200 rounded-lg">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="p-1 px-2 text-gray-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <FaMinus size={12} />
                    </button>
                    <span className="w-10 text-center font-medium select-none text-gray-800">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= currentAvailableStock}
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className="p-1 px-2 text-gray-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SIZE SECTION */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Available Size
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeSizesList.map((size) => {
                  const sizeStock = currentVariantStockMap[size] || 0;
                  const isOutOfStock = sizeStock <= 0;

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => handleSizeChange(size)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        isOutOfStock
                          ? "opacity-40 bg-gray-100 border-gray-200 text-gray-400 line-through cursor-not-allowed"
                          : productType.size === size
                            ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-100 cursor-pointer"
                            : "border-gray-200 text-gray-600 bg-gray-50 hover:border-gray-400 cursor-pointer"
                      }`}
                    >
                      {size.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0 flex justify-between gap-6">
        <button
          onClick={handleCheckout}
          type="button"
          disabled={currentAvailableStock <= 0 || loading}
          className="w-full bg-[#111827] hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl py-3.5 font-bold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer group-hover:shadow-md border-none"
        >
          {currentAvailableStock <= 0 ? "Out of Stock" : "Buy Now"}
        </button>
        <button
          onClick={handleAddToCart}
          type="button"
          disabled={currentAvailableStock <= 0 || loading}
          className="p-3 bg-gray-100 hover:bg-orange-50 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed group cursor-pointer border-none"
          title="Add to Cart Bundle"
        >
          <FaShoppingCart
            size={20}
            className="transition-transform group-hover:-translate-y-0.5 text-orange-600 font-bold"
          />
        </button>
      </div>
    </div>
  );
}