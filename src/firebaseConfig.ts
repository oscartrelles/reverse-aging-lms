import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Detect environment
const hostname = window.location.hostname;
const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1';
const isProduction = hostname === 'academy.7weekreverseagingchallenge.com' || 
                    hostname === 'reverse-aging-academy.web.app';
const isStaging = !isDevelopment && !isProduction;

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: isDevelopment 
    ? 'the-reverse-aging-challenge.web.app'  // Use staging auth domain for development
    : isProduction 
      ? 'academy.7weekreverseagingchallenge.com'  // Production auth domain
      : 'the-reverse-aging-challenge.web.app',    // Staging auth domain
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Log environment info for debugging (development only)
if (process.env.NODE_ENV === 'development') {
  console.log('🌍 Firebase Environment:', {
    hostname,
    isDevelopment,
    isStaging,
    isProduction,
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
  });
}

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

export default app; 