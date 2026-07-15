"use client";

import React, { useState } from "react";
import { FaTimes, FaMinus, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

export default function AddProduct({ setAddProduct }) {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    category: "all",
    price: "",
    featured: false,
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

  // Variants now track sizes as objects: { size: string, stock: number }
  const [variants, setVariants] = useState([
    {
      id: Date.now(),
      color: "",
      image: null,
      preview: "",
      sizes: [], // Stores elements like: { size: "M", stock: 5 }
    },
  ]);

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
        v.id === id ? { ...v, image: file, preview: URL.createObjectURL(file) } : v
      )
    );
  };

  const updateColor = (id, color) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, color } : v))
    );
  };

  // Toggles sizes on/off with an initial stock configuration of 1 unit
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

  // Adjusts specific quantity for a designated variation and size combination
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

  const handleSaveProduct = async () => {
    const baseColors = variants
      .map((v) => v.color.trim().toLowerCase())
      .filter((c) => c !== "");

    if (!product.name || baseColors.length === 0) {
      toast.error("Please enter a product name and at least one variant color.");
      return;
    }

    // Accumulate total rolling inventory sum safely across all individual items
    const globalTotalStock = variants.reduce(
      (sum, v) => sum + v.sizes.reduce((sSum, s) => sSum + s.stock, 0),
      0
    );

    const payload = {
      name: product.name,
      slug: slug,
      description: product.description,
      price: Number(product.price) || 0,
      category: product.category,
      featured: product.featured,
      stock: globalTotalStock, // Computed total fallback count
      colors: baseColors,

      // Maps variants exactly to detailed object maps: { "red": { "S": 10, "M": 4 } }
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
          .map((v) => [
            v.color.trim().toLowerCase(),
            v.image ? `/products/${v.image.name}` : "/placeholder.png",
          ])
      ),
    };

    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));

      variants.forEach((v) => {
        if (v.image) {
          formData.append(`images_${v.color.trim().toLowerCase()}`, v.image);
        }
      });

      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Product saved successfully!");
        setAddProduct(false);
      } else {
        const errData = await response.json();
        toast.error(`Error saving product: ${errData.message || "Internal Server Error"}`);
      }
    } catch (error) {
      console.error("Network upload failure:", error);
      toast.error("Failed to connect to backend api repository.");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setAddProduct(false)} />

      <div className="fixed top-0 right-0 h-screen w-full sm:w-[500px] bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Add New Product</h2>
          <button onClick={() => setAddProduct(false)} className="p-2 text-gray-500 hover:text-black cursor-pointer">
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              placeholder="e.g. Arsenal Jersey"
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
                placeholder="39.90"
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
              rows={4}
              placeholder="Enter item specs details description..."
              value={product.description}
              onChange={(e) => setProduct((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full border rounded-lg px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={product.featured}
              onChange={(e) => setProduct((prev) => ({ ...prev, featured: e.target.checked }))}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700 cursor-pointer">
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
                      <span className="text-[11px] text-gray-400">Upload File</span>
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

                            {/* Individual stock adjustments view elements panel */}
                            {isSelected && (
                              <div className="flex items-center border border-gray-200 roundedbg-white text-[10px] bg-white scale-90">
                                <button
                                  type="button"
                                  onClick={() => updateSizeStock(variant.id, sizeStr, -1)}
                                  className="px-1 text-gray-500 hover:text-black cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="w-5 text-center font-bold text-gray-800">{sizeObj.stock}</span>
                                <button
                                  type="button"
                                  onClick={() => updateSizeStock(variant.id, sizeStr, 1)}
                                  className="px-1 text-gray-500 hover:text-black cursor-pointer"
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
            onClick={handleSaveProduct}
            className="px-6 py-2.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 text-xs font-bold uppercase tracking-wider shadow transition"
          >
            Save Product
          </button>
        </div>
      </div>
    </>
  );
}