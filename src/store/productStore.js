import { create } from 'zustand'
import { fetchProducts } from '../api/dummyjson.js'

// No React imports at module scope, so Vitest can drive this store directly.
// `reset()` restores initialState between tests. See CLAUDE.md section 5.
//
// `categories` and `selectedCategory` from section 5 arrive in phase 3 with the
// category filter — adding them now would be scaffolding ahead of the phase.
const initialState = {
  products: [],
  total: 0,
  loading: false,
  error: null,
}

export const useProductStore = create((set) => ({
  ...initialState,

  loadProducts: async ({ limit, skip } = {}) => {
    set({ loading: true, error: null })

    try {
      const { products, total } = await fetchProducts({ limit, skip })
      set({ products, total, loading: false })
    } catch (err) {
      set({ ...initialState, error: err.message })
    }
  },

  reset: () => set(initialState),
}))
