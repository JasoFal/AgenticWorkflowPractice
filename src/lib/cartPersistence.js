import { isFirebaseConfigured } from './firebaseConfig.js'
import { getCartId } from './cartId.js'

const STORAGE_KEY = 'agentic-storefront-cart'

// localStorage is both the fallback when Firestore isn't configured and a
// mirror when it is, so a network failure never loses the cart outright.
function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) ? parsed : null
  } catch {
    // Corrupt JSON or storage unavailable. A broken cache must not be fatal.
    return null
  }
}

function writeLocal(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Quota exceeded or private mode. Persistence is best-effort.
  }
}

export async function loadCart() {
  if (!isFirebaseConfigured) return readLocal()

  try {
    const { readCart } = await import('./firestoreCart.js')
    const remote = await readCart(getCartId())
    // A brand-new cart id has no document yet; fall through to whatever is
    // local rather than treating "no document" as "empty cart".
    return remote ?? readLocal()
  } catch (err) {
    console.warn('Firestore cart load failed; using local copy.', err)
    return readLocal()
  }
}

export async function saveCart(items) {
  // Write locally first and unconditionally — it's synchronous and can't fail
  // the way a network call can.
  writeLocal(items)

  if (!isFirebaseConfigured) return

  try {
    const { writeCart } = await import('./firestoreCart.js')
    await writeCart(getCartId(), items)
  } catch (err) {
    console.warn('Firestore cart save failed; cart kept locally.', err)
  }
}
