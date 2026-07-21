import { create } from "zustand";

const useCartStore = create((set, get) => ({
  cart: [],
  isLoading: false,

  // A. FETCH/SYNC: Load current unpurchased cart items cleanly
  fetchUserCart: async (customerId) => {
    if (!customerId) return;

    set({ isLoading: true });
    try {
      const res = await fetch(`/api/carts?customerId=${customerId}&isOrdered=false`);
      if (res.ok) {
        const dbCartItems = await res.json();
        set({ cart: dbCartItems, isLoading: false });
      }
    } catch (error) {
      console.error("Cloud synchronizer load failure:", error);
      set({ isLoading: false });
    }
  },

  // B. INSERT / UPDATE
  addToCart: async (product, customerId, customerName, maxStock) => {
    if (!customerId) return;

    // Match by ID if row ID exists, otherwise match by product variant for new inserts
    const existingIndex = get().cart.findIndex(
      (item) =>
        (product.id && item.id === product.id) ||
        (item.productId === product.productId &&
          item.selectedSize === product.selectedSize &&
          item.selectedColor === product.selectedColor)
    );

    let updatedCart = [...get().cart];
    const addedQuantity = product.quantity || 1;

    if (existingIndex !== -1) {
      const currentQty = updatedCart[existingIndex].quantity;
      if (maxStock !== undefined && currentQty + addedQuantity > maxStock) {
        updatedCart[existingIndex].quantity = maxStock;
      } else {
        updatedCart[existingIndex].quantity += addedQuantity;
      }
    } else {
      updatedCart.push({ ...product, quantity: addedQuantity });
    }
    set({ cart: updatedCart });

    try {
      await fetch("/api/carts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          customerId,
          customerName,
          productId: product.productId || product.id,
          name: product.name,
          price: product.price,
          quantity: addedQuantity,
          selectedColor: product.selectedColor,
          selectedSize: product.selectedSize,
          images: product.images || product.image || "/placeholder.jpeg",
        }),
      });
    } catch (error) {
      console.error("Failed to sync insert adjustments:", error);
    }
  },

  // C. STEP INCREMENTS (+1) — Strictly by row `id`
  increaseQuantity: async (product, customerId, customerName, maxStock) => {
    if (!customerId) return;

    const targetItem = get().cart.find((item) => item.id === product.id);
    if (!targetItem) return;

    if (maxStock !== undefined && targetItem.quantity >= maxStock) return;

    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ),
    }));

    try {
      await fetch("/api/carts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          customerName,
          productId: product.productId,
          quantity: 1,
          selectedColor: product.selectedColor,
          selectedSize: product.selectedSize,
          images: product.images || product.image || "/placeholder.jpeg",
        }),
      });
    } catch (err) {
      console.error("Failed to increment quantity:", err);
    }
  },

  // D. STEP DECREMENTS (-1) — Strictly by row `id`
  decreaseQuantity: async (product, customerId, customerName) => {
    if (!customerId) return;

    const targetItem = get().cart.find((item) => item.id === product.id);
    if (!targetItem) return;

    if (targetItem.quantity <= 1) {
      get().removeFromCart(product, customerId);
      return;
    }

    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
      ),
    }));

    try {
      await fetch("/api/carts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          customerName,
          productId: product.productId,
          quantity: -1,
          selectedColor: product.selectedColor,
          selectedSize: product.selectedSize,
          images: product.images || product.image || "/placeholder.jpeg",
        }),
      });
    } catch (err) {
      console.error("Failed to decrement quantity:", err);
    }
  },

  // E. SINGLE REMOVAL — Strictly by row `id`
  removeFromCart: async (product, customerId) => {
    if (!customerId || !product?.id) return;

    // Instantly remove matching primary key from local store
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== product.id),
    }));

    try {
      await fetch("/api/carts/remove-selected", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          selectedIds: [product.id], // Pass clean string ID array
        }),
      });
    } catch (error) {
      console.error("Cloud purge request failed:", error);
    }
  },

  // F. PURGE SELECTED ITEMS — Strictly by array of row `id` strings
  removeSelectedFromCart: async (customerId, selectedItemsList) => {
    if (!customerId || !selectedItemsList || selectedItemsList.length === 0) return;

    // Safely extract string IDs from flat strings or objects
    const selectedIds = selectedItemsList
      .map((item) => (typeof item === "string" ? item : item.id))
      .filter(Boolean);

    if (selectedIds.length === 0) return;

    // 1. Optimistic local client state update: keep items whose ID is NOT in selectedIds
    set((state) => ({
      cart: state.cart.filter((cartItem) => !selectedIds.includes(cartItem.id)),
    }));

    // 2. Cloud DB purge sync
    try {
      await fetch("/api/carts/remove-selected", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, selectedIds }),
      });
    } catch (error) {
      console.error("Failed to sync selected cart removals:", error);
    }
  },

  getTotalItems: () => {
    return get().cart.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));

export default useCartStore;