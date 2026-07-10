import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, isFirebaseAvailable } from '../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { demoStore } from '../lib/demoStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseAvailable && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          let userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            role: 'admin', // Default role for now
            studioName: '',
            phoneNumber: '',
            address: '',
          };
          
          // Fetch additional profile data from Firestore
          try {
            if (db) {
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              if (userDoc.exists()) {
                userData = { ...userData, ...userDoc.data() };
              }
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
          }
          
          setUser(userData);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Demo mode — check localStorage for session
      const savedSession = localStorage.getItem('studio_auth_session');
      if (savedSession) {
        try {
          setUser(JSON.parse(savedSession));
        } catch (e) {
          localStorage.removeItem('studio_auth_session');
        }
      }
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    if (isFirebaseAvailable && auth) {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } else {
      // Demo mode login
      const users = demoStore.getAll('users');
      const found = users.find(u => u.email === email);
      if (found && (password === 'admin123' || password === 'staff123')) {
        const userData = {
          uid: found.uid,
          email: found.email,
          displayName: found.displayName,
          role: found.role,
          studioName: found.studioName || 'Wedding Diary',
          phoneNumber: found.phoneNumber || '',
          address: found.address || '',
        };
        setUser(userData);
        localStorage.setItem('studio_auth_session', JSON.stringify(userData));
        return userData;
      }
      throw new Error('Invalid email or password. Demo: admin@studio.com / admin123');
    }
  };

  const loginWithGoogle = async () => {
    if (isFirebaseAvailable && auth) {
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
      } catch (error) {
        console.error("Google Login Error:", error);
        throw error;
      }
    } else {
      // Demo mode Google Login
      const userData = {
        uid: 'google_demo_123',
        email: 'demo.manager@gmail.com',
        displayName: 'Demo Manager',
        role: 'admin',
        // Deliberately empty studioName to trigger the setup form
        studioName: '',
        phoneNumber: '',
        address: '',
      };
      setUser(userData);
      localStorage.setItem('studio_auth_session', JSON.stringify(userData));
      return userData;
    }
  };

  const updateUserProfile = async (details) => {
    const updatedUser = { ...user, ...details };
    
    if (isFirebaseAvailable && db && user) {
      try {
        await setDoc(doc(db, 'users', user.uid), details, { merge: true });
      } catch (error) {
        console.error("Error updating Firestore profile:", error);
        throw error;
      }
    }
    
    setUser(updatedUser);
    localStorage.setItem('studio_auth_session', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const logout = async () => {
    if (isFirebaseAvailable && auth) {
      await signOut(auth);
    }
    setUser(null);
    localStorage.removeItem('studio_auth_session');
  };

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, updateUserProfile, logout, isAdmin, isStaff, isFirebaseAvailable }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
