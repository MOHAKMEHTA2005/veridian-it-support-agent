// Firebase Client Configuration
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'veridian-it-support-agent.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'veridian-it-support-agent',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'veridian-it-support-agent.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef'
};

let app = null;
let auth = null;
let isConfigured = Boolean(import.meta.env.VITE_FIREBASE_API_KEY);

try {
  if (!getApps().length && isConfigured) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  }
} catch (err) {
  console.warn('[Firebase] Client initialization notice:', err.message);
}

export { auth, isConfigured };

export async function loginWithGoogle() {
  if (!auth) throw new Error('Firebase Auth is not configured. Please supply VITE_FIREBASE_API_KEY in your environment.');
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function loginWithEmail(email, password) {
  if (!auth) throw new Error('Firebase Auth is not configured. Please supply VITE_FIREBASE_API_KEY in your environment.');
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(email, password) {
  if (!auth) throw new Error('Firebase Auth is not configured. Please supply VITE_FIREBASE_API_KEY in your environment.');
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function logOut() {
  if (auth) return fbSignOut(auth);
}

export function subscribeToAuth(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
