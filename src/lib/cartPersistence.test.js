import { loadCart, saveCart } from './cartPersistence.js'
import { getCartId } from './cartId.js'

// Vitest runs in the node environment (vite.config.js), so there is no
// localStorage. A tiny in-memory stand-in keeps these tests offline and avoids
// pulling in jsdom for what is a pure key/value concern.
function installLocalStorage() {
  const store = new Map()
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  }
  return store
}

let store

beforeEach(() => {
  store = installLocalStorage()
})

// No VITE_FIREBASE_* vars are set under test, so isFirebaseConfigured is false
// and these exercise the localStorage fallback — the path that runs whenever
// the app is deployed without Firebase credentials.
describe('localStorage fallback (Firebase not configured)', () => {
  const items = [{ id: 1, title: 'Mascara', price: 9.99, quantity: 2 }]

  it('returns null when nothing has been saved', async () => {
    expect(await loadCart()).toBeNull()
  })

  it('round-trips a saved cart', async () => {
    await saveCart(items)

    expect(await loadCart()).toEqual(items)
  })

  it('persists an empty cart as empty, not as absent', async () => {
    await saveCart(items)
    await saveCart([])

    expect(await loadCart()).toEqual([])
  })

  it('returns null rather than throwing on corrupt JSON', async () => {
    store.set('agentic-storefront-cart', '{not json')

    expect(await loadCart()).toBeNull()
  })

  it('returns null when the stored value is not an array', async () => {
    store.set('agentic-storefront-cart', '{"items":[]}')

    expect(await loadCart()).toBeNull()
  })

  it('does not throw when storage rejects writes', async () => {
    globalThis.localStorage.setItem = () => {
      throw new Error('QuotaExceededError')
    }

    // Persistence is best-effort; a full disk must not break adding to cart.
    await expect(saveCart(items)).resolves.toBeUndefined()
  })
})

describe('getCartId', () => {
  it('generates an id and reuses it on subsequent calls', () => {
    const first = getCartId()
    const second = getCartId()

    expect(first).toBeTruthy()
    expect(second).toBe(first)
  })

  it('still returns a usable id when storage is unavailable', () => {
    globalThis.localStorage.getItem = () => {
      throw new Error('SecurityError')
    }

    expect(getCartId()).toBeTruthy()
  })
})
