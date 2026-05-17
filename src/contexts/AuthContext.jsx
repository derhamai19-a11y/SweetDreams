import { createContext, useContext, useEffect, useState } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as fbSignOut
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [adultProfile, setAdultProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password)
  const signOut = () => fbSignOut(auth)

  return (
    <AuthContext.Provider value={{ 
      user, adultProfile, loading, signIn, signUp, signOut, refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
