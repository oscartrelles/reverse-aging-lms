import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Debug: Log Firebase configuration
console.log('Firebase config loaded:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!firebaseConfig.apiKey
});

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
    console.log('Starting Facebook sign-in process...');
    console.log('Current URL:', window.location.href);
    console.log('Firebase auth domain:', firebaseConfig.authDomain);
    console.log('Facebook provider:', facebookProvider);
    
    // Debug: Check if we can access the client ID
    console.log('Firebase config:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      apiKey: firebaseConfig.apiKey ? 'Present' : 'Missing'
    });
    
    await signInWithRedirect(auth, facebookProvider);
  } catch (error) {
    console.error('Facebook sign-in error:', (error as any).message);
    throw error;
  }
};

// Google Sign-In function (back to redirect)
export const signInWithGoogle = async () => {
  try {
    console.log('Starting Google sign-in process...');
    console.log('Current URL:', window.location.href);
    console.log('Firebase auth domain:', firebaseConfig.authDomain);
    console.log('Google provider:', googleProvider);
    
    // Debug: Check if we can access the client ID
    console.log('Firebase config:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      apiKey: firebaseConfig.apiKey ? 'Present' : 'Missing'
    });
    
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error('Sign-in error:', (error as any).message);
    throw error;
  }
};

// Handle redirect result function (copying the working implementation)
export const handleRedirectResult = async () => {
  try {
    console.log('=== Redirect Result Debug ===');
    console.log('Checking for redirect result...');
    const result = await getRedirectResult(auth);
    console.log('getRedirectResult returned:', result);
    if (result) {
      console.log('Sign-in successful:', result.user.email);
      return result;
    } else {
      console.log('No redirect result found');
      return null;
    }
  } catch (error) {
    console.error('Redirect error:', (error as any).message);
    return null;
  } finally {
    console.log('=== End Redirect Result Debug ===');
  }
};

export default app; 