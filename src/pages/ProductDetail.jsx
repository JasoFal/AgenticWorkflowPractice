import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { useProductStore } from '../store/productStore.js'
import ProductGallery from '../components/ProductGallery.jsx'

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export default function ProductDetail() {
  const { id } = useParams()

  const product = useProductStore((s) => s.product)
  const loading = useProductStore((s) => s.loading)
  const error = useProductStore((s) => s.error)
  const loadProduct = useProductStore((s) => s.loadProduct)

  useEffect(() => {
    loadProduct(id)
  }, [loadProduct, id])

  if (loading) {
    return (
      <p role="status" aria-live="polite">
        Loading product…
      </p>
    )
  }

  if (error) {
    return (
      <div role="alert" className="alert alert-red">
        <div className="alert-content">
          <strong>Couldn&rsquo;t load this product.</strong> {error}
        </div>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => loadProduct(id)}
        >
          Try again
        </button>
      </div>
    )
  }

  if (!product) return null

  // images[] is the gallery source per section 7; thumbnail is the fallback.
  const images = product.images?.length ? product.images : [product.thumbnail]

  return (
    <>
      <div className="units-row">
        <div className="unit-100">
          <p>
            <Link to="/products">&larr; Back to products</Link>
          </p>
        </div>
      </div>

      <div className="units-row gap">
        <div className="unit-50 tablet-unit-100">
          <ProductGallery
            key={product.id}
            title={product.title}
            images={images}
          />
        </div>

        <div className="unit-50 tablet-unit-100">
          <h1>{product.title}</h1>

          {product.brand && (
            <p>
              <strong>{product.brand}</strong>
            </p>
          )}

          <p>
            <Link to={`/products?category=${product.category}`}>
              {product.category}
            </Link>
          </p>

          <p>
            <strong>{priceFormatter.format(product.price)}</strong>{' '}
            {product.discountPercentage > 0 && (
              <span className="badge">
                {product.discountPercentage}% off available
              </span>
            )}
          </p>

          <p>
            Rating: {product.rating} / 5 &middot; {product.availabilityStatus} (
            {product.stock} in stock)
          </p>

          <p>{product.description}</p>

          <dl>
            <dt>Warranty</dt>
            <dd>{product.warrantyInformation}</dd>
            <dt>Shipping</dt>
            <dd>{product.shippingInformation}</dd>
            <dt>Returns</dt>
            <dd>{product.returnPolicy}</dd>
          </dl>
        </div>
      </div>
    </>
  )
}
