import { Link } from 'react-router'

// Built from Ply helpers rather than a `.card` class — Ply has no card
// component. card.html defines `.card` in its own inline <style> block, so
// copying that snippet verbatim yields unstyled markup. `border`,
// `border-radius`, and `padding` are real Ply classes and need no custom CSS.

// Module scope: constructing an Intl formatter is not free, and it never varies.
const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export default function ProductCard({ product }) {
  const titleId = `product-${product.id}-title`
  const href = `/products/${product.id}`

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
      <p>{priceFormatter.format(product.price)}</p>
    </article>
  )
}
