import { useState } from 'react'
import { useCartStore } from '../store/cartStore.js'

// Quantity being typed is transient view state, so it stays local. Only the
// committed add() reaches the shared store. See CLAUDE.md section 3.
export default function AddToCart({ product }) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const add = useCartStore((s) => s.add)

  const outOfStock = product.stock === 0

  function handleAdd() {
    add(product, quantity)
    setAdded(true)
  }

  return (
    <div className="units-row gap-sm">
      <div className="unit-auto">
        <label htmlFor="add-quantity">
          Quantity
          <input
            id="add-quantity"
            type="number"
            min="1"
            value={quantity}
            disabled={outOfStock}
            onChange={(e) => {
              const next = Number.parseInt(e.target.value, 10)
              // Ignore an empty field mid-edit rather than committing NaN.
              if (!Number.isNaN(next) && next >= 1) setQuantity(next)
            }}
          />
        </label>
      </div>
      <div className="unit-auto">
        <button
          type="button"
          className="btn btn-primary"
          disabled={outOfStock}
          onClick={handleAdd}
        >
          {outOfStock ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
      {/* Confirmation is announced rather than only shown, so the action isn't
          silent for anyone not watching the navbar badge. */}
      <div className="unit-100" role="status" aria-live="polite">
        {added ? `Added to cart.` : ''}
      </div>
    </div>
  )
}
