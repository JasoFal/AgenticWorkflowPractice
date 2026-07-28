const CART_ID_KEY = 'agentic-storefront-cart-id'

// Firebase Auth is a stretch goal that §3 says to skip, so carts are keyed by a
// random id generated on first visit and kept in localStorage. That means the
// cart follows the browser, not a person: clearing site data or switching
// devices starts a new cart.
//
// Security consequence, documented in .env.example: the Firestore rules for the
// `carts` collection have to permit unauthenticated access. Fine for a course
// project; not safe for real customer data. Adding Firebase Auth is what would
// let the rules require request.auth != null.
export function getCartId() {
  try {
    const existing = localStorage.getItem(CART_ID_KEY)
    if (existing) return existing

    const id = newId()
    localStorage.setItem(CART_ID_KEY, id)
    return id
  } catch {
    // Private mode or storage disabled: fall back to a per-session id so the
    // app still works, it just won't persist.
    return newId()
  }
}

function newId() {
  // randomUUID needs a secure context. localhost and Vercel both qualify, but
  // fall back rather than throwing on the odd http:// LAN preview.
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `cart-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}
