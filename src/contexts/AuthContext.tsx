import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  updateProfile,
  getRedirectResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db, googleProvider, facebookProvider, handleRedirectResult, signInWithGoogle as firebaseSignInWithGoogle } from '../firebaseConfig';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function signUp(email: string, password: string, name: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile
      await updateProfile(result.user, { displayName: name });
      
      // Create user document in Firestore
      const userData: User = {
        id: result.user.uid,
        email: result.user.email!,
        name: name,
        photoURL: result.user.photoURL || undefined,
        createdAt: Timestamp.now(),
        isAdmin: false,
        notificationPreferences: {
          email: true,
          push: true,
          reminderTime: '08:00',
        },
      };
      
      await setDoc(doc(db, 'users', result.user.uid), userData);
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  async function signIn(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async function signInWithGoogle() {
    try {
      console.log('=== Google Sign-In Debug ===');
      console.log('Starting Google sign-in...');
      
      // Add custom parameters to force account selection
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Use the working implementation from firebaseConfig
      await firebaseSignInWithGoogle();
      console.log('=== End Google Sign-In Debug ===');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  async function signInWithFacebook() {
    try {
      await signInWithRedirect(auth, facebookProvider);
    } catch (error) {
      console.error('Error signing in with Facebook:', error);
      throw error;
    }
  }

  async function handleSocialSignIn(firebaseUser: FirebaseUser) {
    console.log('Handling social sign in for user:', firebaseUser.uid);
    
    try {
      // Test Firestore connectivity first
      console.log('Testing Firestore connectivity...');
      const testDoc = await getDoc(doc(db, 'users', 'test'));
      console.log('Firestore connectivity test passed');
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        console.log('Creating new user document...');
        // Create new user document
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || 'Unknown User',
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: Timestamp.now(),
          isAdmin: false,
          notificationPreferences: {
            email: true,
            push: true,
            reminderTime: '08:00',
          },
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        console.log('User document created successfully');
        setCurrentUser(userData);
      } else {
        console.log('User document already exists, updating current user');
        // Update existing user with latest info
        const userData = userDoc.data() as User;
        setCurrentUser(userData);
      }
    } catch (error) {
      console.error('Error in handleSocialSignIn:', error);
      // Even if Firestore fails, we should still set the user as authenticated
      // Create a minimal user object from Firebase Auth data
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.displayName || 'Unknown User',
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: Timestamp.now(),
        isAdmin: false,
        notificationPreferences: {
          email: true,
          push: true,
          reminderTime: '08:00',
        },
      };
      setCurrentUser(userData);
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  async function updateUserProfile(updates: Partial<User>) {
    if (!currentUser) throw new Error('No user logged in');
    
    try {
      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, updates);
      
      setCurrentUser({ ...currentUser, ...updates });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('=== INITIALIZING AUTH ===');
      
      // Set up persistent auth state listener first
      console.log('Setting up persistent auth state listener...');
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log('Auth state changed:', user ? `User signed in (${user.uid})` : 'User signed out');
        setFirebaseUser(user);
        
        if (user) {
          try {
            console.log('Fetching user document for:', user.uid);
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              console.log('User document found, setting current user');
              setCurrentUser(userDoc.data() as User);
            } else {
              console.log('User document not found, creating new user document');
              await handleSocialSignIn(user);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            // Fallback: create user object from Firebase Auth data
            console.log('Creating fallback user object from Firebase Auth data');
            const userData: User = {
              id: user.uid,
              email: user.email!,
              name: user.displayName || 'Unknown User',
              photoURL: user.photoURL || undefined,
              createdAt: Timestamp.now(),
              isAdmin: false,
              notificationPreferences: {
                email: true,
                push: true,
                reminderTime: '08:00',
              },
            };
            setCurrentUser(userData);
          }
        } else {
          console.log('Setting currentUser to null');
          setCurrentUser(null);
        }
        
        setLoading(false);
      });

      // Check for redirect result after setting up the listener
      // Add a small delay to ensure Firebase is ready
      setTimeout(async () => {
        try {
          console.log('Checking for redirect result...');
          const result = await getRedirectResult(auth);
          console.log('Direct getRedirectResult returned:', result);
          if (result) {
            console.log('Redirect result found, user should be signed in');
            // The redirect result will trigger onAuthStateChanged
          } else {
            console.log('No redirect result found');
          }
        } catch (error) {
          console.error('Error handling redirect result:', error);
        }
      }, 100);

      return unsubscribe;
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 