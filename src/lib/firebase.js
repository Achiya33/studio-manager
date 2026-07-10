// Firebase initialization with graceful fallback
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app = null;
let db = null;
let auth = null;
let isFirebaseAvailable = false;

try {
  const hasConfig = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_api_key';
  if (hasConfig) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    isFirebaseAvailable = true;
  } else {
    console.warn('Firebase config not found. Running in local/demo mode.');
  }
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

export { app, db, auth, isFirebaseAvailable, firebaseConfig };
