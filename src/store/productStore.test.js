import { useProductStore } from './productStore.js'
import {
  fetchCategories,
  fetchProduct,
  fetchProducts,
  fetchProductsByCategory,
} from '../api/dummyjson.js'

// The store is the unit under test; HTTP is not. Mocking the api module keeps
// these tests offline and deterministic.
vi.mock('../api/dummyjson.js', () => ({
  fetchProducts: vi.fn(),
  fetchProductsByCategory: vi.fn(),
  fetchCategories: vi.fn(),
  fetchProduct: vi.fn(),
}))

const store = () => useProductStore.getState()

const envelope = {
  products: [{ id: 1, title: 'Essence Mascara Lash Princess' }],
  total: 194,
}

beforeEach(() => {
  vi.clearAllMocks()
  useProductStore.getState().reset()
})

describe('loadProducts', () => {
  it('populates products and total, and clears loading', async () => {
    fetchProducts.mockResolvedValue(envelope)

    await store().loadProducts({ limit: 8 })

    expect(fetchProducts).toHaveBeenCalledWith({ limit: 8, skip: undefined })
    expect(store().products).toHaveLength(1)
    expect(store().total).toBe(194)
    expect(store().loading).toBe(false)
    expect(store().error).toBeNull()
  })

  it('routes through the category endpoint when a slug is given', async () => {
    fetchProductsByCategory.mockResolvedValue({ products: [], total: 0 })

    await store().loadProducts({ limit: 24, category: 'beauty' })

    expect(fetchProductsByCategory).toHaveBeenCalledWith('beauty', {
      limit: 24,
      skip: undefined,
    })
    expect(fetchProducts).not.toHaveBeenCalled()
    expect(store().selectedCategory).toBe('beauty')
  })

  it('clears selectedCategory when no slug is given', async () => {
    fetchProductsByCategory.mockResolvedValue({ products: [], total: 0 })
    await store().loadProducts({ category: 'beauty' })

    fetchProducts.mockResolvedValue(envelope)
    await store().loadProducts({})

    expect(store().selectedCategory).toBeNull()
  })

  it('records the error and empties products on failure', async () => {
    fetchProducts.mockRejectedValue(new Error('DummyJSON request failed: 500'))

    await store().loadProducts({})

    expect(store().error).toMatch(/500/)
    expect(store().products).toEqual([])
    expect(store().loading).toBe(false)
  })

  it('preserves categories through a failed product fetch', async () => {
    fetchCategories.mockResolvedValue([{ slug: 'beauty', name: 'Beauty' }])
    await store().loadCategories()

    fetchProducts.mockRejectedValue(new Error('boom'))
    await store().loadProducts({})

    // The filter control must survive so the user can pick another category
    // instead of being stranded on a dead page.
    expect(store().categories).toHaveLength(1)
    expect(store().error).toBe('boom')
  })
})

describe('loadCategories', () => {
  it('stores the category list', async () => {
    fetchCategories.mockResolvedValue([
      { slug: 'beauty', name: 'Beauty' },
      { slug: 'furniture', name: 'Furniture' },
    ])

    await store().loadCategories()

    expect(store().categories.map((c) => c.slug)).toEqual([
      'beauty',
      'furniture',
    ])
  })

  it('degrades to an empty list without surfacing an error', async () => {
    fetchCategories.mockRejectedValue(new Error('offline'))

    await store().loadCategories()

    expect(store().categories).toEqual([])
    // The filter is an enhancement; its failure must not blank the listing.
    expect(store().error).toBeNull()
  })
})

describe('loadProduct', () => {
  it('stores the fetched product', async () => {
    fetchProduct.mockResolvedValue({ id: 6, title: 'Calvin Klein CK One' })

    await store().loadProduct(6)

    expect(fetchProduct).toHaveBeenCalledWith(6)
    expect(store().product).toMatchObject({ id: 6 })
    expect(store().loading).toBe(false)
  })

  it('clears any previously loaded product before fetching', async () => {
    fetchProduct.mockResolvedValue({ id: 6, title: 'First' })
    await store().loadProduct(6)

    let resolvePending
    fetchProduct.mockReturnValue(
      new Promise((res) => {
        resolvePending = res
      }),
    )
    const pending = store().loadProduct(7)

    // Mid-flight the old product must be gone, so a stale one never flashes.
    expect(store().product).toBeNull()
    expect(store().loading).toBe(true)

    resolvePending({ id: 7, title: 'Second' })
    await pending
    expect(store().product).toMatchObject({ id: 7 })
  })

  it('records a 404 as an error and leaves product null', async () => {
    fetchProduct.mockRejectedValue(
      new Error('DummyJSON request failed: 404 Not Found'),
    )

    await store().loadProduct(99999)

    expect(store().product).toBeNull()
    expect(store().error).toMatch(/404/)
    expect(store().loading).toBe(false)
  })
})
