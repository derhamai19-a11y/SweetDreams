import { createContext, useContext, useEffect, useState } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as fbSignOut
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, firebaseConfigured } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [adultProfile, setAdultProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!firebaseConfigured) {
      setError(new Error('Firebase is not configured. Set VITE_FIREBASE_* values in Netlify Build Environment or local .env files.'))
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser)
      if (fbUser) {
        try {
          const snap = await getDoc(doc(db, 'adults', fbUser.uid))
          setAdultProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null)
        } catch (e) {
          console.error('Error loading profile:', e)
          setAdultProfile(null)
        }
      } else {
        setAdultProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const refreshProfile = async () => {
    if (!user) return
    const snap = await getDoc(doc(db, 'adults', user.uid))
    setAdultProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  }

  const ensureConfigured = () => {
    if (!firebaseConfigured) {
      throw new Error('Firebase is not configured. Set VITE_FIREBASE_* env vars in Netlify Build Environment or local .env files.')
    }
  }

  const signIn = (email, password) => {
    ensureConfigured()
    return signInWithEmailAndPassword(auth, email, password)
  }
  const signUp = (email, password) => {
    ensureConfigured()
    return createUserWithEmailAndPassword(auth, email, password)
  }
  const signOut = () => {
    ensureConfigured()
    return fbSignOut(auth)
  }

  return (
    <AuthContext.Provider value={{ 
      user, adultProfile, loading, error, signIn, signUp, signOut, refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
