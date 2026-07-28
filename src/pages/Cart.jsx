import { Link } from 'react-router'
import {
  useCartStore,
  selectItemCount,
  selectSubtotal,
} from '../store/cartStore.js'
import { formatPrice } from '../lib/formatPrice.js'

export default function Cart() {
  // Narrow slices, and the derived values come through selectors so this
  // component re-renders only when the number it shows actually changes.
  const items = useCartStore((s) => s.items)
  const itemCount = useCartStore(selectItemCount)
  const subtotal = useCartStore(selectSubtotal)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const remove = useCartStore((s) => s.remove)
  const clear = useCartStore((s) => s.clear)

  function handleQuantityChange(id, raw) {
    const next = Number.parseInt(raw, 10)
    // Ignore intermediate states such as an empty field mid-edit; committing
    // NaN would delete the line out from under the user as they type.
    if (Number.isNaN(next)) return
    setQuantity(id, next)
  }

  if (items.length === 0) {
    return (
      <div className="units-row">
        <div className="unit-100">
          <h1>Your cart</h1>
          <p>Your cart is empty.</p>
          <Link className="btn btn-primary" to="/products">
            Browse products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="units-row">
        <div className="unit-100">
          <h1>Your cart</h1>
          <p role="status" aria-live="polite">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      <div className="units-row">
        <div className="unit-100">
          {/* table-container keeps the table scrollable instead of blowing out
              the page width on a phone. */}
          <div className="table-container">
            <table
              className="table-stroked table-hovered"
              aria-label="Cart items"
            >
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Price</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Line total</th>
                  <th scope="col">
                    <span className="hide-text">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link to={`/products/${item.id}`}>{item.title}</Link>
                    </td>
                    <td>{formatPrice(item.price)}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        aria-label={`Quantity for ${item.title}`}
                        onChange={(e) =>
                          handleQuantityChange(item.id, e.target.value)
                        }
                      />
                    </td>
                    <td>{formatPrice(item.price * item.quantity)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-red"
                        onClick={() => remove(item.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" colSpan={3}>
                    Subtotal
                  </th>
                  <td colSpan={2}>
                    <strong>{formatPrice(subtotal)}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div className="units-row gap">
        <div className="unit-auto">
          <button type="button" className="btn btn-outline" onClick={clear}>
            Clear cart
          </button>
        </div>
        <div className="unit-auto">
          <Link className="btn btn-primary" to="/products">
            Continue shopping
          </Link>
        </div>
      </div>
    </>
  )
}
