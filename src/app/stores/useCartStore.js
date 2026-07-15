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

  // B. INSERT / UPDATE: Stock-guarded insertion rules
  addToCart: async (product, customerId, customerName, maxStock) => {
    if (!customerId) return;

    const existingIndex = get().cart.findIndex(
      (item) =>
        item.productId === product.productId &&
        item.selectedSize === product.selectedSize &&
        item.selectedColor === product.selectedColor
    );

    let updatedCart = [...get().cart];
    const addedQuantity = product.quantity || 1;

    if (existingIndex !== -1) {
      const currentQty = updatedCart[existingIndex].quantity;
      // 🌟 GUARD: Stop increment if added quantity exceeds maximum live stock
      if (maxStock !== undefined && currentQty + addedQuantity > maxStock) {
        updatedCart[existingIndex].quantity = maxStock; // Caps at max limit
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
          productId: product.productId,
          name: product.name,
          price: product.price,
          quantity: addedQuantity,
          selectedColor: product.selectedColor,
          selectedSize: product.selectedSize,
          images: product.images || "/placeholder.jpeg",
        }),
      });
    } catch (error) {
      console.error("Failed to sync structural insert adjustments:", error);
    }
  },

  // C. STEP INCREMENTS (+1): Safeguarded with dynamic stock caps
  increaseQuantity: async (product, customerId, customerName, maxStock) => {
    if (!customerId) return;

    const targetItem = get().cart.find((item) => item.id === product.id);
    if (!targetItem) return;

    // 🌟 THE ULTIMATE STOCK GUARD: Block operations if they match or exceed max available stock
    if (maxStock !== undefined && targetItem.quantity >= maxStock) {
      return; 
    }

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
          images: product.images || "/placeholder.jpeg",
        }),
      });
    } catch (err) {
      console.error("Failed to increment quantity payload sync:", err);
    }
  },

  // D. STEP DECREMENTS (-1)
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
          images: product.images || "/placeholder.jpeg",
        }),
      });
    } catch (err) {
      console.error("Failed to decrement quantity payload sync:", err);
    }
  },

  // E. DELETE REMOVALS
  removeFromCart: async (product, customerId) => {
    if (!customerId) return;

    set((state) => ({
      cart: state.cart.filter((item) => item.id !== product.id),
    }));

    try {
      await fetch("/api/carts/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, id: product.id }),
      });
    } catch (error) {
      console.error("Cloud purge request transmission drop:", error);
    }
  },

  // F. PURGE SELECTED
  removeSelectedFromCart: async (customerId, selectedItemsList) => {
    if (!customerId || !selectedItemsList || selectedItemsList.length === 0) return;

    const selectedIds = selectedItemsList.map((item) => item.id);

    set((state) => ({
      cart: state.cart.filter((item) => !selectedIds.includes(item.id)),
    }));

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