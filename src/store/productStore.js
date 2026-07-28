import { create } from 'zustand'
import {
  fetchCategories,
  fetchProducts,
  fetchProductsByCategory,
} from '../api/dummyjson.js'

// No React imports at module scope, so Vitest can drive this store directly.
// `reset()` restores initialState between tests. See CLAUDE.md section 5.
const initialState = {
  products: [],
  categories: [],
  selectedCategory: null,
  total: 0,
  loading: false,
  error: null,
}

export const useProductStore = create((set) => ({
  ...initialState,

  // `category` is a slug from /products/categories, or undefined for all.
  loadProducts: async ({ limit, skip, category } = {}) => {
    const selectedCategory = category ?? null
    set({ loading: true, error: null, selectedCategory })

    try {
      const { products, total } = category
        ? await fetchProductsByCategory(category, { limit, skip })
        : await fetchProducts({ limit, skip })

      set({ products, total, loading: false })
    } catch (err) {
      // Preserve categories so the filter control survives a failed product
      // fetch — otherwise the user loses the means to pick a different one.
      set((state) => ({
        ...initialState,
        categories: state.categories,
        selectedCategory,
        error: err.message,
      }))
    }
  },

  // Deliberately does not surface an error. The filter is an enhancement; if
  // it fails the select degrades to "All categories" rather than taking the
  // listing down with it.
  loadCategories: async () => {
    try {
      set({ categories: await fetchCategories() })
    } catch {
      set({ categories: [] })
    }
  },

  reset: () => set(initialState),
}))
