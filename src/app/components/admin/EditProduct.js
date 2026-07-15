"use client";

import React, { useState, useEffect } from "react";
import { FaTimes, FaMinus, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

export default function EditProduct({ initialProduct, setEditProduct, onUpdateSuccess }) {
  const [product, setProduct] = useState({
    id: initialProduct?.id || "",
    name: initialProduct?.name || "",
    description: initialProduct?.description || "",
    category: initialProduct?.category || "all",
    price: initialProduct?.price || "",
    featured: initialProduct?.featured || false,
  });

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

  const slug = product.name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const [variants, setVariants] = useState([]);

  useEffect(() => {
    if (initialProduct) {
      let dbImages = {};
      let dbSizes = {};

      try {
        dbImages = typeof initialProduct.images === "string" ? JSON.parse(initialProduct.images) : (initialProduct.images || {});
        dbSizes = typeof initialProduct.sizes === "string" ? JSON.parse(initialProduct.sizes) : (initialProduct.sizes || {});
      } catch (e) {
        console.error("Failed to parse JsonB fields inside product editor initialization:", e);
        toast.error("Failed to parse product data.");
      }

      const activeColors = initialProduct.colors || Object.keys(dbImages);

      if (activeColors.length > 0) {
        const structuralVariants = activeColors.map((color, index) => {
          // Convert incoming object model map {"S": 5, "M": 12} into local state array structures
          const rawSizesObject = dbSizes[color] || {};
          const structuredSizesArray = Object.entries(rawSizesObject).map(([sizeKey, stockValue]) => ({
            size: sizeKey,
            stock: Number(stockValue) || 1
          }));

          return {
            id: Date.now() + index + Math.random(),
            color: color,
            image: null,
            preview: dbImages[color] || "/placeholder.png", 
            sizes: structuredSizesArray,
            isExisting: true, 
          };
        });
        setVariants(structuralVariants);
      } else {
        setVariants([{ id: Date.now(), color: "", image: null, preview: "", sizes: [] }]);
      }
    }
  }, [initialProduct]);

  const addVariant = () => {
    if (variants.length >= 3) return;
    setVariants((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        color: "",
        image: null,
        preview: "",
        sizes: [],
      },
    ]);
  };

  const removeVariant = (id) => {
    if (variants.length === 1) return;
    setVariants((prev) => prev.filter((item) => item.id !== id));
  };

  const handleImageChange = (id, file) => {
    if (!file) return;
    setVariants((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, image: file, preview: URL.createObjectURL(file), isExisting: false } : v
      )
    );
  };

  const updateColor = (id, color) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, color } : v))
    );
  };

  const toggleSize = (variantId, sizeStr) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== variantId) return v;
        const exists = v.sizes.some((s) => s.size === sizeStr);
        return {
          ...v,
          sizes: exists
            ? v.sizes.filter((s) => s.size !== sizeStr)
            : [...v.sizes, { size: sizeStr, stock: 1 }],
        };
      })
    );
  };

  const updateSizeStock = (variantId, sizeStr, delta) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== variantId) return v;
        return {
          ...v,
          sizes: v.sizes.map((s) =>
            s.size === sizeStr ? { ...s, stock: Math.max(1, s.stock + delta) } : s
          ),
        };
      })
    );
  };

  const handleUpdateProduct = async () => {
    const baseColors = variants
      .map((v) => v.color.trim().toLowerCase())
      .filter((c) => c !== "");

    if (!product.name || baseColors.length === 0) {
      toast.error("Please enter a product name and configure at least one variant.");
      return;
    }

    let existingImagesMap = {};
    try {
      existingImagesMap = typeof initialProduct.images === "string" ? JSON.parse(initialProduct.images) : (initialProduct.images || {});
    } catch (e) {}

    // Calculate dynamic aggregate total stock count across all options
    const globalTotalStock = variants.reduce(
      (sum, v) => sum + v.sizes.reduce((sSum, s) => sSum + s.stock, 0),
      0
    );

    const payload = {
      id: product.id,
      name: product.name,
      slug: slug,
      description: product.description,
      price: Number(product.price) || 0,
      category: product.category,
      featured: product.featured,
      stock: globalTotalStock, 
      colors: baseColors,

      // Format array back into JSON Object structure mapping {"s": 4, "m": 12}
      sizes: Object.fromEntries(
        variants
          .filter((v) => v.color.trim())
          .map((v) => [
            v.color.trim().toLowerCase(),
            Object.fromEntries(v.sizes.map((s) => [s.size, s.stock])),
          ])
      ),

      images: Object.fromEntries(
        variants
          .filter((v) => v.color.trim())
          .map((v) => {
            const normalizedColor = v.color.trim().toLowerCase();
            let linkValue = "/placeholder.png";
            
            if (v.isExisting && existingImagesMap[normalizedColor]) {
              linkValue = existingImagesMap[normalizedColor];
            } else if (v.image) {
              linkValue = `/products/${v.image.name}`;
            }
            return [normalizedColor, linkValue];
          })
      ),
    };

    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));

      variants.forEach((v) => {
        if (v.image && !v.isExisting) {
          formData.append(`images_${v.color.trim().toLowerCase()}`, v.image);
        }
      });

      const response = await fetch("/api/products", {
        method: "PUT", 
        body: formData,
      });

      if (response.ok) {
        toast.success("Product record updated successfully!");
        if (onUpdateSuccess) onUpdateSuccess(); 
        setEditProduct(false);
      } else {
        const errData = await response.json();
        toast.error(`Failed to apply updates: ${errData.error || "Server Error"}`);
      }
    } catch (error) {
      console.error("Transmission update network error:", error);
      toast.error("Failed to connect to the backend update pipeline.");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setEditProduct(false)} />

      <div className="fixed top-0 right-0 h-screen w-full sm:w-[500px] bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-xl font-semibold text-gray-800 truncate">Edit {product.name}</h2>
          <button onClick={() => setEditProduct(false)} className="p-2 text-gray-500 hover:text-black cursor-pointer">
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => setProduct((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={product.price}
                onChange={(e) => setProduct((prev) => ({ ...prev, price: e.target.value }))}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Category</label>
              <select
                className="w-full border rounded-lg px-4 py-3 outline-none bg-white"
                value={product.category}
                onChange={(e) => setProduct((prev) => ({ ...prev, category: e.target.value }))}
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              value={product.description}
              onChange={(e) => setProduct((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full border rounded-lg px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-featured"
              checked={product.featured}
              onChange={(e) => setProduct((prev) => ({ ...prev, featured: e.target.checked }))}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="edit-featured" className="text-sm font-medium text-gray-700 cursor-pointer">
              Mark this item as Featured Product
            </label>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Configure Product Variants</h3>
          </div>

          {variants.map((variant) => (
            <div key={variant.id} className="border-2 border-gray-100 rounded-2xl p-4 bg-gray-50/50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4">
                <div>
                  <label className="w-full h-36 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 bg-white transition relative overflow-hidden">
                    {variant.preview ? (
                      <img src={variant.preview} alt="Preview" className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-[11px] text-gray-400">No Image Found</span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => handleImageChange(variant.id, e.target.files[0])}
                    />
                  </label>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Color Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Red, Black"
                      value={variant.color}
                      onChange={(e) => updateColor(variant.id, e.target.value)}
                      className="w-full bg-white rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Select Sizes & Quantities</label>
                    <div className="flex flex-wrap gap-2">
                      {["S", "M", "L", "XL", "XXL"].map((sizeStr) => {
                        const sizeObj = variant.sizes.find((s) => s.size === sizeStr);
                        const isSelected = !!sizeObj;

                        return (
                          <div key={sizeStr} className="flex flex-col items-center gap-1">
                            <button
                              type="button"
                              onClick={() => toggleSize(variant.id, sizeStr)}
                              className={`w-10 h-9 flex items-center justify-center rounded-lg border text-xs font-bold transition cursor-pointer ${
                                isSelected
                                  ? "border-orange-500 bg-orange-500 text-white"
                                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                              }`}
                            >
                              {sizeStr}
                            </button>

                            {isSelected && (
                              <div className="flex items-center border border-gray-200 rounded bg-white text-[10px] scale-90">
                                <button
                                  type="button"
                                  onClick={() => updateSizeStock(variant.id, sizeStr, -1)}
                                  className="px-1 text-gray-500 hover:text-black cursor-pointer shadow-none"
                                >
                                  -
                                </button>
                                <span className="w-5 text-center font-bold text-gray-800">{sizeObj.stock}</span>
                                <button
                                  type="button"
                                  onClick={() => updateSizeStock(variant.id, sizeStr, 1)}
                                  className="px-1 text-gray-500 hover:text-black cursor-pointer shadow-none"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {variants.length > 1 && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeVariant(variant.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider"
                      >
                        Remove Variant
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-4 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            disabled={variants.length >= 3}
            onClick={addVariant}
            className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-xs font-bold uppercase tracking-wider transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Add Color Variant
          </button>

          <button
            type="button"
            onClick={handleUpdateProduct}
            className="px-6 py-2.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 text-xs font-bold uppercase tracking-wider shadow transition"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </>
  );
}