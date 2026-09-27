import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, isFirebaseAvailable } from '../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { authFetch } from '../lib/authFetch';
import { demoStore } from '../lib/demoStore';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userStudios, setUserStudios] = useState([]);
  const [activeStudio, setActiveStudio] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStudios = async (uid) => {
    try {
      const studiosRes = await authFetch(`${API_URL}/api/studios/my-studios/${uid}`);
      if (studiosRes.ok) {
        const studiosData = await studiosRes.json();
        setUserStudios(studiosData);
        if (studiosData.length > 0) {
          const savedActiveId = localStorage.getItem('active_studio_id');
          const found = studiosData.find(s => s._id === savedActiveId);
          setActiveStudio(found || studiosData[0]);
        } else {
          setActiveStudio(null);
        }
      }
    } catch (e) {
      console.error("Failed to fetch studios", e);
    }
  };

  useEffect(() => {
    if (isFirebaseAvailable && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // SECURITY: Get a fresh ID token to send to the backend
            const token = await firebaseUser.getIdToken();

            // Sync with our Node.js backend (with auth token)
            const response = await fetch(`${API_URL}/api/users/sync`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                photoURL: firebaseUser.photoURL || '',
              }),
            });
            
            if (response.ok) {
              const userData = await response.json();
              setUser(userData);
              localStorage.setItem('studio_auth_session', JSON.stringify(userData));
              
              // Fetch Studios
              await fetchStudios(userData.uid);
            } else {
              console.error("Failed to sync user with backend");
              setUser(null);
            }
          } catch (error) {
            console.error("Error communicating with backend:", error);
            setUser(null);
          }
        } else {
          setUser(null);
          setUserStudios([]);
          setActiveStudio(null);
          localStorage.removeItem('studio_auth_session');
          localStorage.removeItem('active_studio_id');
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Demo mode
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    if (isFirebaseAvailable && auth) {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } else {
      throw new Error('Demo Mode Login Disabled for Workspaces');
    }
  };

  const register = async (name, email, password) => {
    if (isFirebaseAvailable && auth) {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(result.user, { displayName: name });
      }
      return result.user;
    } else {
      throw new Error('Registration is not supported in Demo Mode.');
    }
  };

  const resetPassword = async (email) => {
    if (isFirebaseAvailable && auth) {
      await sendPasswordResetEmail(auth, email);
    } else {
      throw new Error('Password reset is not supported in Demo Mode.');
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
      throw new Error('Demo Mode Google Login Disabled');
    }
  };

  const updateUserProfile = async (details, uidOverride) => {
    try {
      const targetUid = uidOverride || user?.uid;
      if (!targetUid) throw new Error("No user ID available for profile update");

      const response = await authFetch(`${API_URL}/api/users/${targetUid}`, {
        method: 'PUT',
        body: JSON.stringify(details),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem('studio_auth_session', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const createStudio = async (details, uidOverride) => {
    try {
      const targetUid = uidOverride || user?.uid;
      if (!targetUid) throw new Error("No user ID available to create studio");

      const response = await authFetch(`${API_URL}/api/studios`, {
        method: 'POST',
        body: JSON.stringify({
          name: details.studioName,
          type: details.studioType,
          phone: details.phoneNumber,
          address: details.address,
          logoUrl: details.logoUrl,
          uid: targetUid
        }),
      });

      if (!response.ok) throw new Error('Failed to create studio');
      const newStudio = await response.json();
      
      // Update state
      setUserStudios([...userStudios, newStudio]);
      setActiveStudio(newStudio);
      localStorage.setItem('active_studio_id', newStudio._id);
      
      return newStudio;
    } catch (error) {
      console.error("Error creating studio:", error);
      throw error;
    }
  };

  const switchStudio = (studioId) => {
    const found = userStudios.find(s => s._id === studioId);
    if (found) {
      setActiveStudio(found);
      localStorage.setItem('active_studio_id', found._id);
    }
  };

  const logout = async () => {
    if (isFirebaseAvailable && auth) {
      await signOut(auth);
    }
    setUser(null);
    setUserStudios([]);
    setActiveStudio(null);
    localStorage.removeItem('studio_auth_session');
    localStorage.removeItem('active_studio_id');
  };

  // Check role within the active studio
  let isAdmin = false;
  let isStaff = false;
  if (activeStudio && user) {
    const member = activeStudio.members.find(m => m.uid === user.uid);
    if (member) {
      isAdmin = member.role === 'admin';
      isStaff = member.role === 'staff' || member.role === 'admin';
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, loading, login, register, resetPassword, loginWithGoogle, 
      updateUserProfile, createStudio, logout, 
      userStudios, activeStudio, switchStudio, setUserStudios, setActiveStudio,
      isAdmin, isStaff, isFirebaseAvailable 
    }}>
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
