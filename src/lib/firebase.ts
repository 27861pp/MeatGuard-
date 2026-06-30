/**
 * Firebase bootstrap.
 *
 * If the VITE_FIREBASE_* env vars are present we initialise the real SDK.
 * Otherwise the app transparently switches to DEMO MODE (see useAuth /
 * useSensorData) so the entire product is explorable with zero config.
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

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

/** True only when the minimum required keys are configured. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
);

/** When false, the app generates auth + sensor data locally. */
export const DEMO_MODE = !isFirebaseConfigured;

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Database | undefined;
let googleProvider: GoogleAuthProvider | undefined;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  // Persist the session across reloads / app reopens — sign in once.
  setPersistence(auth, browserLocalPersistence).catch((e) => {
    // eslint-disable-next-line no-console
    console.warn("[MEAT GUARD] could not set local persistence", e);
  });
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: "select_account" });
  if (firebaseConfig.databaseURL) {
    db = getDatabase(app);
  }
} else if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info(
    "%c[MEAT GUARD] Running in DEMO MODE — add Firebase keys to .env for live data.",
    "color:#22c55e;font-weight:bold"
  );
}

export { app, auth, db, googleProvider };
