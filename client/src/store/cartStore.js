import { create } from "zustand";

const useCartStore = create((set, get) => ({
  items: [],

  addItem: (variant, productName) => {
    const items = get().items;
    const existing = items.find((i) => i.variantId === variant.id);
    if (existing) {
      set({
        items: items.map((i) =>
          i.variantId === variant.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      });
    } else {
      set({
        items: [
          ...items,
          {
            variantId: variant.id,
            productName,
            size: variant.size,
            flavor: variant.flavor,
            price: parseFloat(variant.price),
            quantity: 1,
          },
        ],
      });
    }
  },

  removeItem: (variantId) => {
    set({ items: get().items.filter((i) => i.variantId !== variantId) });
  },

  updateQuantity: (variantId, quantity) => {
    if (quantity < 1) return;
    set({
      items: get().items.map((i) =>
        i.variantId === variantId ? { ...i, quantity } : i,
      ),
    });
  },

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  },
}));

export default useCartStore;
