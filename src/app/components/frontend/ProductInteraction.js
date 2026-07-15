"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa";
import { toast } from "react-toastify";
import useCartStore from "../../stores/useCartStore";

export default function ProductInteraction({
  product,
  selectedSize,
  selectedColor,
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { addToCart } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  // Extract sizes keys based on the selected color
  const colorVariantStockMap = product?.sizes?.[selectedColor] || {};
  const availableSizes = Object.keys(colorVariantStockMap);

  // 1. Automated fallback: Set first available size key by default if parameters are clean
  useEffect(() => {
    if (!selectedSize && availableSizes.length > 0) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("size", availableSizes[0]);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [selectedSize, availableSizes, pathname, router, searchParams]);

  // Fetch precise remaining balance inventory sum for color + size selection intersection
  const currentAvailableStock = colorVariantStockMap[selectedSize] || 0;

  // Reset counters to prevent adding more than newly updated limit constraints
  useEffect(() => {
    setQuantity(1);
  }, [selectedColor, selectedSize]);

  const handleTypeChange = (type, value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(type, value);

    // Dynamic reset matching structural keys shifts
    if (type === "color") {
      const nextColorSizes = product?.sizes?.[value] ? Object.keys(product.sizes[value]) : [];
      if (nextColorSizes.length > 0) {
        params.set("size", nextColorSizes[0]);
      } else {
        params.delete("size");
      }
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select a size and color variant configuration.");
      return;
    }

    if (currentAvailableStock <= 0) {
      toast.error("This specific size and color variation is out of stock.");
      return;
    }

    const newCartItemId =
      "c" +
      Math.random().toString(36).substring(2, 11) +
      Math.random().toString(36).substring(2, 11);

    addToCart({
      id: newCartItemId,
      productId: product.id,
      name: product.name,
      price: product.price,
      images: product.images,
      quantity: quantity,
      selectedSize,
      selectedColor,
    });

    toast.success(`${product.name} added to cart successfully!`);
  };

  const handleBuyNow = () => {
    if (currentAvailableStock <= 0) return;
    handleAddToCart();
    router.push("/cart");
  };

  return (
    <div className="flex flex-col gap-6 max-w-md">
      {/* Size Selector */}
      {availableSizes.length > 0 && (
        <div className="flex flex-col gap-2.5 text-sm">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Size</span>
            {selectedSize && (
              <span className={`text-xs font-bold ${currentAvailableStock <= 5 ? "text-orange-600 animate-pulse" : "text-gray-400"}`}>
                {currentAvailableStock <= 0 ? "Out of Stock" : `${currentAvailableStock} units remaining`}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {availableSizes.map((size) => {
              const isSelected = selectedSize === size;
              const sizeStock = colorVariantStockMap[size] || 0;
              const isSizeOutOfStock = sizeStock <= 0;

              return (
                <button
                  key={size}
                  type="button"
                  disabled={isSizeOutOfStock}
                  onClick={() => handleTypeChange("size", size)}
                  className={`h-9 min-w-9 px-3 text-xs font-bold border rounded-lg transition-all duration-200 ${
                    isSizeOutOfStock
                      ? "opacity-40 bg-gray-100 border-gray-200 text-gray-400 line-through cursor-not-allowed"
                      : isSelected
                        ? "border-black bg-black text-white shadow-sm cursor-pointer"
                        : "border-gray-200 bg-white text-gray-800 hover:border-gray-400 cursor-pointer"
                  }`}
                >
                  {size.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {product?.colors?.length > 0 && (
        <div className="flex flex-col gap-2.5 text-sm">
          <span className="font-semibold text-gray-700">Color Variant</span>
          <div className="flex items-center gap-3">
            {product.colors.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleTypeChange("color", color)}
                  style={{ backgroundColor: color }}
                  className={`w-7 h-7 rounded-full cursor-pointer transition-all duration-200 relative ${
                    isSelected
                      ? "ring-2 ring-black ring-offset-2 scale-110"
                      : "hover:scale-105 border border-gray-200"
                  }`}
                  title={color}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      {currentAvailableStock > 0 && (
        <div className="flex flex-col gap-2.5 text-sm">
          <span className="font-semibold text-gray-700">Quantity</span>
          <div className="flex items-center border border-gray-300 rounded-lg w-fit bg-white">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="p-2.5 px-3 text-gray-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <FaMinus size={10} />
            </button>
            <span className="w-10 text-center font-bold select-none text-gray-800">
              {quantity}
            </span>
            <button
              type="button"
              disabled={quantity >= currentAvailableStock}
              onClick={() => setQuantity((prev) => prev + 1)}
              className="p-2.5 px-3 text-gray-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <FaPlus size={10} />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mt-2">
        <button
          type="button"
          disabled={currentAvailableStock <= 0}
          onClick={handleAddToCart}
          className="w-full text-sm font-bold bg-black hover:bg-gray-900 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <FaShoppingCart />
          {currentAvailableStock <= 0 ? "Out of Stock" : "Add to Cart"}
        </button>

        {currentAvailableStock > 0 && (
          <button
            type="button"
            onClick={handleBuyNow}
            className="w-full text-sm font-bold border border-gray-300 hover:bg-gray-50 text-gray-900 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            Buy Now
          </button>
        )}
      </div>
    </div>
  );
}