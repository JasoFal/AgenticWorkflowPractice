import { Link } from 'react-router'
import { useCartStore } from '../store/cartStore.js'
import { formatPrice } from '../lib/formatPrice.js'

// Built from Ply helpers rather than a `.card` class — Ply has no card
// component. card.html defines `.card` in its own inline <style> block, so
// copying that snippet verbatim yields unstyled markup. `border`,
// `border-radius`, and `padding` are real Ply classes and need no custom CSS.
export default function ProductCard({ product }) {
  const titleId = `product-${product.id}-title`
  const href = `/products/${product.id}`
  const add = useCartStore((s) => s.add)

  return (
    <article className="border border-radius padding" aria-labelledby={titleId}>
      <Link to={href} tabIndex={-1} aria-hidden="true">
        {/* alt="" is deliberate: the title link below already names the product,
            so describing the image would make screen readers announce it twice. */}
        <img
          src={product.thumbnail}
          alt=""
          loading="lazy"
          width="200"
          height="200"
        />
      </Link>
      <h3 id={titleId}>
        <Link to={href}>{product.title}</Link>
      </h3>
      <p>{formatPrice(product.price)}</p>
      <button
        type="button"
        className="btn btn-sm btn-primary"
        // The visible label is just "Add to cart" on every card, so the
        // accessible name has to carry the product or a screen reader hears
        // the same button repeated down the grid.
        aria-label={`Add ${product.title} to cart`}
        onClick={() => add(product)}
      >
        Add to cart
      </button>
    </article>
  )
}
