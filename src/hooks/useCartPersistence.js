import { useEffect, useRef } from 'react'
import { useCartStore } from '../store/cartStore.js'
import { loadCart, saveCart } from '../lib/cartPersistence.js'

// Mounted once from App. Loads the stored cart on startup and writes it back
// whenever items change.
export function useCartPersistence() {
  const items = useCartStore((s) => s.items)
  const hydrated = useRef(false)

  useEffect(() => {
    let cancelled = false

    loadCart().then((saved) => {
      if (cancelled) return

      const current = useCartStore.getState().items
      // Only hydrate into an empty cart. If the user managed to add something
      // while the load was still in flight, their action wins over the stored
      // copy rather than being silently overwritten.
      const didHydrate = Boolean(saved?.length) && current.length === 0
      if (didHydrate) useCartStore.getState().hydrate(saved)

      hydrated.current = true

      // Anything added during the load was skipped by the save effect's guard
      // below, so flush it now.
      const after = useCartStore.getState().items
      if (!didHydrate && after.length > 0) saveCart(after)
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    // The guard that matters: without it the empty initial cart would be
    // written over the stored one on every single page load, before loadCart
    // ever resolves.
    if (!hydrated.current) return
    saveCart(items)
  }, [items])
}
