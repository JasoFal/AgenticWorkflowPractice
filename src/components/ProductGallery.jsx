import { useState } from 'react'

// Rendered with key={product.id} by ProductDetail. That key is what resets the
// selected image when navigating between products — remounting is React's
// recommended way to reset state on identity change, and it avoids the
// setState-inside-useEffect cascade that react-hooks/set-state-in-effect flags.
export default function ProductGallery({ title, images }) {
  const [activeImage, setActiveImage] = useState(0)

  return (
    <>
      <img src={images[activeImage]} alt={title} width="400" height="400" />

      {images.length > 1 && (
        <div
          className="units-row gap-sm"
          role="group"
          aria-label="Product images"
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              className="btn btn-ghost btn-sm"
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-pressed={i === activeImage}
              onClick={() => setActiveImage(i)}
            >
              <img src={src} alt="" width="60" height="60" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </>
  )
}
