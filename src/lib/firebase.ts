/**
 * Firebase bootstrap.
 *
 * The config below is the project's *web* configuration. Firebase web keys are
 * public by design — they ship in every Firebase web app's client bundle and
 * are safe to commit. Access is controlled by Auth authorized-domains and the
 * Realtime Database security rules (see FIREBASE_RULES.json), NOT by the key.
 *
 * VITE_FIREBASE_* env vars override these defaults when present (e.g. to point
 * a fork at a different project).
 */
import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  type Auth,
} from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";

// Default project: meat-83f83 (baked in so the deployed app connects to real
// Firebase without any secret setup).
const DEFAULT_FIREBASE = {
  apiKey: "AIzaSyA4sLKQy-mrmfcYNsptYo8fCt0H63gDGE4",
  authDomain: "meat-83f83.firebaseapp.com",
  projectId: "meat-83f83",
  storageBucket: "meat-83f83.firebasestorage.app",
  messagingSenderId: "619234872715",
  appId: "1:619234872715:web:a9f953a8cb5434ef97338e",
  databaseURL:
    "https://meat-83f83-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE.appId,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || DEFAULT_FIREBASE.databaseURL,
};

// Config is always present (baked defaults + env overrides) — initialise
// unconditionally. The app shows only real data; there is no demo fallback.
const app: FirebaseApp = initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);
// Persist the session across reloads / app reopens — sign in once.
setPersistence(auth, browserLocalPersistence).catch((e) => {
  // eslint-disable-next-line no-console
  console.warn("[MEAT GUARD] could not set local persistence", e);
});

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const db: Database = getDatabase(app);

export { auth, db, googleProvider };
