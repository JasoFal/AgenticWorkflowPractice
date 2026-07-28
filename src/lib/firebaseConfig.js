// Deliberately imports nothing from the firebase SDK. Anything that statically
// imports `firebase/app` gets pulled into the main bundle, so the "is Firebase
// even configured?" question has to be answerable without it. firestoreCart.js
// is dynamically imported only once this returns true, which keeps ~300 kB of
// SDK out of the bundle for anyone running without credentials.
//
// Only VITE_-prefixed vars reach client code, and everything in the browser
// bundle is public. Firebase web config is not secret — access is controlled
// by Firestore security rules, not by hiding these values. See CLAUDE.md §13.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// apiKey + projectId are the two that make a connection possible at all.
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
)
