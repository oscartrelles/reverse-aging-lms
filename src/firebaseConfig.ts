import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, GoogleAuthProvider, FacebookAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const hostname = window.location.hostname;
const isProduction = hostname === 'academy.7weekreverseagingchallenge.com' ||
                     hostname === 'reverse-aging-academy.web.app' ||
                     hostname === 'reverseaging.academy';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: isProduction 
    ? 'the-reverse-aging-challenge.firebaseapp.com'  // Production auth domain
    : 'the-reverse-aging-challenge.firebaseapp.com', // Staging auth domain
  projectId: 'the-reverse-aging-challenge',
  storageBucket: 'the-reverse-aging-challenge.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Create a persistent provider instance
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Set custom parameters for better mobile compatibility
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

// Facebook Sign-In function
export const signInWithFacebook = async () => {
  try {
    await signInWithRedirect(auth, facebookProvider);
  } catch (error) {
    console.error('Facebook sign-in error:', (error as any).message);
    throw error;
  }
};

// Google Sign-In function
export const signInWithGoogle = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error('Google sign-in error:', (error as any).message);
    throw error;
  }
};

// Handle redirect result function
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    console.error('Redirect error:', (error as any).message);
    return null;
  }
};

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('🔧 Connected to Firebase emulators');
  } catch (error) {
    console.log('⚠️ Firebase emulators already connected or not available');
  }
}

export default app; 