import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { useProductStore } from '../store/productStore.js'
import ProductCard from '../components/ProductCard.jsx'

const PAGE_LIMIT = 24

export default function ProductList() {
  // The URL is the source of truth for the filter, so a filtered view can be
  // linked and bookmarked. See CLAUDE.md section 4.
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') ?? ''

  const products = useProductStore((s) => s.products)
  const categories = useProductStore((s) => s.categories)
  const total = useProductStore((s) => s.total)
  const loading = useProductStore((s) => s.loading)
  const error = useProductStore((s) => s.error)
  const loadProducts = useProductStore((s) => s.loadProducts)
  const loadCategories = useProductStore((s) => s.loadCategories)

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  useEffect(() => {
    loadProducts({ limit: PAGE_LIMIT, category: category || undefined })
  }, [loadProducts, category])

  function handleCategoryChange(event) {
    const next = event.target.value
    // replace: true keeps the back button meaningful — flipping through five
    // filters shouldn't require five presses to leave the page.
    setSearchParams(next ? { category: next } : {}, { replace: true })
  }

  const retry = () =>
    loadProducts({ limit: PAGE_LIMIT, category: category || undefined })

  return (
    <>
      <div className="units-row">
        <div className="unit-100">
          <h1>Products</h1>
        </div>
      </div>

      <div className="units-row">
        <div className="unit-50 tablet-unit-100">
          <label htmlFor="category-filter">
            Category
            <select
              id="category-filter"
              value={category}
              onChange={handleCategoryChange}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                // slug is the value, name is the label. Section 7.
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {loading && (
        <p role="status" aria-live="polite">
          Loading products…
        </p>
      )}

      {error && (
        <div role="alert" className="alert alert-red">
          <div className="alert-content">
            <strong>Couldn&rsquo;t load products.</strong> {error}
          </div>
          <button type="button" className="btn btn-sm" onClick={retry}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <p role="status" aria-live="polite">
            {products.length === 0
              ? 'No products match this category.'
              : `Showing ${products.length} of ${total} products`}
          </p>

          <div className="units-row gap equal-height">
            {products.map((product) => (
              <div
                key={product.id}
                className="unit-25 tablet-unit-50 large-phone-unit-100"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}
