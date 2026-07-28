import { useEffect } from 'react'
import { Link } from 'react-router'
import { useProductStore } from '../store/productStore.js'
import ProductCard from '../components/ProductCard.jsx'

const FEATURED_LIMIT = 8

export default function Home() {
  // Narrow slices, never a whole-store destructure — a destructure re-renders
  // this component on every unrelated store change. See CLAUDE.md section 5.
  const products = useProductStore((s) => s.products)
  const loading = useProductStore((s) => s.loading)
  const error = useProductStore((s) => s.error)
  const loadProducts = useProductStore((s) => s.loadProducts)

  useEffect(() => {
    loadProducts({ limit: FEATURED_LIMIT })
  }, [loadProducts])

  return (
    <>
      <div className="units-row">
        <div className="unit-100">
          <h1>Featured products</h1>
        </div>
      </div>

      {loading && (
        <p role="status" aria-live="polite">
          Loading featured products…
        </p>
      )}

      {error && (
        <div role="alert" className="alert alert-red">
          <div className="alert-content">
            <strong>Couldn&rsquo;t load products.</strong> {error}
          </div>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => loadProducts({ limit: FEATURED_LIMIT })}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* equal-height keeps card borders level when titles wrap to
              different line counts. */}
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

          <div className="units-row margin-top-extra">
            <div className="unit-100">
              <Link className="btn btn-primary" to="/products">
                Browse all products
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}
