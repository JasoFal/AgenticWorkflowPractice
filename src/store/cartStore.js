import { create } from 'zustand'

// No React imports at module scope so Vitest can drive this directly.
// See CLAUDE.md section 5.
const initialState = { items: [] }

// Lines hold a snapshot of the product fields the cart needs rather than the
// whole product object. Two reasons: a DummyJSON product carries reviews and
// meta the cart has no use for, and a snapshot keeps the line stable if the
// upstream product changes underneath it.
function toLine(product, quantity) {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    thumbnail: product.thumbnail,
    quantity,
  }
}

export const useCartStore = create((set) => ({
  ...initialState,

  add: (product, qty = 1) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === product.id)

      // Adding an item already in the cart bumps its quantity — it must not
      // create a second line for the same product.
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + qty } : i,
          ),
        }
      }

      return { items: [...state.items, toLine(product, qty)] }
    }),

  remove: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  // Quantity at or below zero removes the line rather than leaving a 0-qty
  // ghost that still renders and contributes nothing.
  setQuantity: (id, qty) =>
    set((state) =>
      qty <= 0
        ? { items: state.items.filter((i) => i.id !== id) }
        : {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: qty } : i,
            ),
          },
    ),

  clear: () => set(initialState),

  // Replaces items wholesale from persisted storage. Separate from add() so
  // restoring a saved cart can't be confused with a user action, and so
  // useCartPersistence has a single obvious entry point.
  hydrate: (items) => set({ items: Array.isArray(items) ? items : [] }),

  reset: () => set(initialState),
}))

// Derived, never stored — a cached count or subtotal can drift out of sync
// with items. Section 5. Exported as selectors so components can subscribe to
// just the derived value: useCartStore(selectItemCount).
export const selectItemCount = (state) =>
  state.items.reduce((n, i) => n + i.quantity, 0)

export const selectSubtotal = (state) =>
  state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
