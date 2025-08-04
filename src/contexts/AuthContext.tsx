import { createContext, useContext, useState, useEffect } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile, 
  getRedirectResult
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db, googleProvider, facebookProvider, signInWithGoogle as firebaseSignInWithGoogle, signInWithFacebook as firebaseSignInWithFacebook } from '../firebaseConfig';
import { User } from '../types';
import { emailIntegrationService } from '../services/emailIntegrationService';

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
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
        photoURL: result.user.photoURL || undefined,
        createdAt: Timestamp.now(),
        isAdmin: false,
        bio: '',
        age: 0,
        location: '',
        goals: ['Improve energy levels', 'Build sustainable habits'],
        notificationPreferences: {
          email: true,
          push: true,
          reminderTime: '08:00',
          weeklyDigest: true,
          scientificUpdates: true,
          communityUpdates: false,
        },
      };
      
      await setDoc(doc(db, 'users', result.user.uid), userData);
      setCurrentUser(userData);

      // Send welcome email and schedule welcome series
      try {
        await emailIntegrationService.sendWelcomeEmail(userData, false);
        await emailIntegrationService.scheduleWelcomeSeries(userData);
      } catch (emailError) {
        console.warn('Failed to send welcome email:', emailError);
        // Don't fail the signup if email fails
      }
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
      // Add custom parameters to force account selection
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Use the working implementation from firebaseConfig
      await firebaseSignInWithGoogle();
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      
      // Handle the specific case where an account already exists with the same email
      if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with this email address using a different sign-in method. Please sign in with your original email and password, or use the "Forgot Password" option if you need to reset your password.');
      }
      
      // Handle other common errors
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.');
      }
      
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup was blocked. Please allow popups for this site and try again.');
      }
      
      throw error;
    }
  }

  async function signInWithFacebook() {
    try {
      // Use the working implementation from firebaseConfig
      await firebaseSignInWithFacebook();
    } catch (error: any) {
      console.error('Error signing in with Facebook:', error);
      
      // Handle the specific case where an account already exists with the same email
      if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with this email address using a different sign-in method. Please sign in with your original email and password, or use the "Forgot Password" option if you need to reset your password.');
      }
      
      // Handle other common errors
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.');
      }
      
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup was blocked. Please allow popups for this site and try again.');
      }
      
      throw error;
    }
  }

  async function handleSocialSignIn(firebaseUser: FirebaseUser) {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Determine auth provider from Firebase user
        const authProvider = firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 
                           firebaseUser.providerData[0]?.providerId === 'facebook.com' ? 'facebook' : 
                           'email';
        
        // Parse name more intelligently
        const fullName = firebaseUser.displayName || 'Unknown User';
        const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Create new user document
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: fullName,
          firstName,
          lastName,
          photoURL: firebaseUser.photoURL || undefined,
          authProvider,
          socialProviderId: firebaseUser.providerData[0]?.uid,
          createdAt: Timestamp.now(),
          isAdmin: false,
          bio: '',
          age: 0,
          location: '',
          goals: ['Improve energy levels', 'Build sustainable habits'],
          notificationPreferences: {
            email: true,
            push: true,
            reminderTime: '08:00',
            weeklyDigest: true,
            scientificUpdates: true,
            communityUpdates: false,
          },
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        setCurrentUser(userData);
        
        // Send welcome email for new social users
        try {
          await emailIntegrationService.sendWelcomeEmail(userData, true);
          await emailIntegrationService.scheduleWelcomeSeries(userData);
        } catch (emailError) {
          console.warn('Failed to send welcome email:', emailError);
          // Don't fail the sign-in if email fails
        }
        
        // Redirect new social users to profile page
        if (authProvider !== 'email') {
          // Use setTimeout to ensure the user is set before redirecting
          setTimeout(() => {
            window.location.href = '/profile';
          }, 500);
        }
      } else {
        // Update existing user with latest social info
        const existingUserData = userDoc.data() as User;
        
        // Update social provider info if not already set
        const authProvider = existingUserData.authProvider || 
                           (firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 
                           firebaseUser.providerData[0]?.providerId === 'facebook.com' ? 'facebook' : 
                           'email');
        
        const updates: Partial<User> = {
          photoURL: firebaseUser.photoURL || existingUserData.photoURL,
          authProvider,
          socialProviderId: existingUserData.socialProviderId || firebaseUser.providerData[0]?.uid,
        };
        
        // Update name if it's more complete from social provider
        if (firebaseUser.displayName && (!existingUserData.firstName || !existingUserData.lastName)) {
          const fullName = firebaseUser.displayName;
          const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
          updates.firstName = nameParts[0] || existingUserData.firstName;
          updates.lastName = nameParts.slice(1).join(' ') || existingUserData.lastName;
          updates.name = fullName;
        }
        
        await updateDoc(doc(db, 'users', firebaseUser.uid), updates);
        const updatedUserData = { ...existingUserData, ...updates };
        setCurrentUser(updatedUserData);
      }
    } catch (error) {
      console.error('Error in handleSocialSignIn:', error);
      throw error;
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
      // Check for immediate OAuth parameters
      const urlParams = new URLSearchParams(window.location.search);
      const hasOAuthParams = urlParams.has('code') || urlParams.has('state') || urlParams.has('apiKey');

      if (hasOAuthParams) {
        // Immediate check
        const immediateResult = await getRedirectResult(auth);
        if (immediateResult) {
          // User is already signed in from redirect
          return;
        }
      }
      
      // Set up persistent auth state listener first
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setFirebaseUser(user);
        
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              setCurrentUser(userDoc.data() as User);
            } else {
              await handleSocialSignIn(user);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            // Fallback: create user object from Firebase Auth data
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
          setCurrentUser(null);
        }
        
        setLoading(false);
      });

      // Check for redirect result after setting up the listener
      const checkRedirectResult = async (attempt: number = 1) => {
        try {
          const result = await getRedirectResult(auth);
          if (result) {
            // The redirect result will trigger onAuthStateChanged
          } else {
            // Check if there are any URL parameters that might indicate a redirect
            const urlParams = new URLSearchParams(window.location.search);
            const hasAuthParams = urlParams.has('apiKey') || urlParams.has('authType') || urlParams.has('providerId');
            const hasCode = urlParams.has('code');
            const hasState = urlParams.has('state');
            
            if (hasAuthParams || hasCode || hasState) {
              // If we have a code parameter, this is likely a successful OAuth flow
              if (hasCode) {
                // Clear the URL parameters to prevent infinite loops
                const cleanUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, cleanUrl);
              }
            }
            
            // Try again after a delay if this is the first attempt
            if (attempt === 1) {
              setTimeout(() => checkRedirectResult(2), 3000);
            }
          }
        } catch (error) {
          console.error('Error handling redirect result:', error);
          // Don't let redirect errors break the auth initialization
        }
      };

      setTimeout(() => checkRedirectResult(), 2000); // Initial delay of 2 seconds

      return unsubscribe;
    };

    // Wrap initialization in try-catch to handle any DOM-related errors
    try {
      initializeAuth();
    } catch (error) {
      console.error('Error during auth initialization:', error);
      setLoading(false);
    }
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