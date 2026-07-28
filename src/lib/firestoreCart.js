import { getApps, initializeApp } from 'firebase/app'
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { firebaseConfig } from './firebaseConfig.js'

// Only ever reached through a dynamic import from cartPersistence.js, and only
// when isFirebaseConfigured is true. Importing this module statically anywhere
// would defeat the code-splitting that keeps the SDK out of the main bundle.

const COLLECTION = 'carts'

function db() {
  // Vite HMR can re-evaluate this module; initializeApp twice throws.
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  return getFirestore(app)
}

export async function readCart(cartId) {
  const snap = await getDoc(doc(db(), COLLECTION, cartId))
  if (!snap.exists()) return null
  return snap.data().items ?? null
}

export async function writeCart(cartId, items) {
  await setDoc(doc(db(), COLLECTION, cartId), {
    items,
    updatedAt: serverTimestamp(),
  })
}
