"use client";

import React from "react";

export default function ProductTable({
  currentProductsSlice,
  selectedColors,
  handleColorChange,
  selectedIds,
  setSelectedIds,
  openMenu,
  setOpenMenu,
  setSelectedProduct,
  setEditProduct,
  openDeleteModal,
  router
}) {
  
  const handleToggleSelectAll = (e) => {
    if (e.target.checked) {
      const allSliceIds = currentProductsSlice.map((p) => p.id);
      setSelectedIds(allSliceIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectRow = (productId) => {
    setSelectedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs md:text-sm relative">
        <thead>
          <tr className="bg-[#111827] border-b border-zinc-800 text-zinc-300 font-bold uppercase tracking-wider text-[11px]">
            <th className="w-12 text-center py-4 pl-4">
              <input
                type="checkbox"
                checked={currentProductsSlice.length > 0 && currentProductsSlice.every((p) => selectedIds.includes(p.id))}
                onChange={handleToggleSelectAll}
                className="cursor-pointer accent-orange-500 w-4 h-4 rounded"
              />
            </th>
            <th className="px-4 py-4">Product</th>
            <th className="px-4 py-4">Colors</th>
            <th className="px-4 py-4">Description</th>
            <th className="px-4 py-4">Price</th>
            <th className="px-4 py-4">Status</th>
            <th className="px-4 py-4 text-right"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {currentProductsSlice.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-zinc-400 font-medium">
                No active listings found in database inventory.
              </td>
            </tr>
          ) : (
            currentProductsSlice.map((product, index) => {
              const currentColor = selectedColors[product.id] || product.colors?.[0] || "white";
              const colorVariantStockMap = product.sizes?.[currentColor] || {};
              const availableSizes = Object.keys(colorVariantStockMap);
              const currentInventorySum = Object.values(colorVariantStockMap).reduce((sum, stock) => sum + Number(stock), 0)
                
              console.log(currentInventorySum)

              // Compute stock rolling totals
            

              const isLastRow = index >= currentProductsSlice.length -2;
              const shouldOpenUpwards = currentProductsSlice.length <= 1|| isLastRow;


              return (
                <tr
                  key={product.id}
                  onClick={() => router.push(`/admin/products/${product.id}`)}
                  className={`transition-colors cursor-pointer ${
                    selectedIds.includes(product.id) ? "bg-orange-50/30" : "hover:bg-zinc-50/70"
                  }`}
                >
                  {/* Row Checkbox */}
                  <td className="text-center py-4 pl-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => handleToggleSelectRow(product.id)}
                      className="cursor-pointer accent-orange-500 w-4 h-4 rounded"
                    />
                  </td>

                  {/* Product Column */}
                  <td className="px-4 py-4 align-middle">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#111827] border border-zinc-800 flex-shrink-0 relative">
                        {product.images?.[currentColor] && (
                          <img
                            src={product.images[currentColor]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900 text-sm tracking-tight">{product.name}</h3>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {availableSizes.length === 0 ? (
                            <span className="text-[10px] text-zinc-400 font-medium italic">No sizes setup</span>
                          ) : (
                            availableSizes.map((size) => {
                              const stockCount = colorVariantStockMap[size] || 0;
                              return (
                                <span
                                  key={size}
                                  className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                                    stockCount <= 0
                                      ? "bg-zinc-50 border-zinc-200 text-zinc-400 line-through opacity-50"
                                      : "bg-zinc-100 border-zinc-200 text-zinc-800"
                                  }`}
                                  title={`Stock: ${stockCount} units`}
                                >
                                  {size} ({stockCount})
                                </span>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Colors Column */}
                  <td className="px-4 py-4 align-middle" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      {product.colors?.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleColorChange(product.id, color)}
                          className={`w-5 h-5 rounded-full border-2 transition-all duration-150 relative cursor-pointer ${
                            selectedColors[product.id] === color
                              ? "border-orange-500 scale-110 shadow-sm"
                              : "border-zinc-300 hover:border-zinc-400"
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </td>

                  {/* Description Column */}
                  <td className="px-4 py-4 align-middle">
                    <p className="text-zinc-500 text-xs line-clamp-2 max-w-xs">{product.description}</p>
                  </td>

                  {/* Price Column */}
                  <td className="px-4 py-4 align-middle">
                    <span className="font-bold text-sm text-zinc-900">${Number(product.price).toFixed(2)}</span>
                  </td>

                  {/* Status Column */}
                  <td className="px-4 py-4 align-middle">
                    {currentInventorySum <= 0 ? (
                      <span className="inline-flex items-center bg-red-50 border border-red-200 text-red-600 font-bold px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider">
                        Out Of Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-orange-50 border border-orange-200 text-orange-600 font-bold px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider">
                        In Stock ({currentInventorySum})
                      </span>
                    )}
                  </td>

                  {/* Context Actions Menu Dropdown */}
                  <td className="px-4 py-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="relative flex justify-end">
                      <button
                        type="button"
                        onClick={() => setOpenMenu(openMenu === product.id ? null : product.id)}
                        className="w-8 h-8 rounded-lg hover:bg-zinc-100 text-zinc-600 font-bold flex items-center justify-center transition cursor-pointer"
                      >
                        •••
                      </button>

                      {openMenu === product.id && (
                        <>
                          <div className="fixed inset-0 z-50 " onClick={() => setOpenMenu(null)} />
                          <div
                            className={`absolute right-0 w-40 bg-black border border-zinc-800 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden ${
                              shouldOpenUpwards ? "bottom-0 origin-bottom" : "top-1 origin-top"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProduct(product);
                                setEditProduct(true);
                                setOpenMenu(null);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-zinc-900 text-white text-xs font-medium transition-colors cursor-pointer"
                            >
                              Edit Product
                            </button>
                            <button
                              type="button"
                              onClick={() => router.push(`/admin/products/${product.id}`)}
                              className="w-full text-left px-4 py-2.5 hover:bg-zinc-900 text-white text-xs font-medium transition-colors cursor-pointer"
                            >
                              View Statistics
                            </button>
                            <div className="h-px bg-zinc-800 my-1" />
                            <button
                              type="button"
                              onClick={() => openDeleteModal(product)}
                              className="w-full text-left px-4 py-2.5 hover:bg-zinc-900 text-red-400 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Delete Product
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}