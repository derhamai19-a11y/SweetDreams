import { createContext, useContext, useEffect, useState } from 'react'
import { doc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from './AuthContext'

const HouseholdContext = createContext(null)

export function HouseholdProvider({ children }) {
  const { adultProfile } = useAuth()
  const [household, setHousehold] = useState(null)
  const [adults, setAdults] = useState([])
  const [child, setChild] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [tonightPrep, setTonightPrep] = useState(null)
  const [loading, setLoading] = useState(true)

  const householdId = adultProfile?.householdId

  // Household doc
  useEffect(() => {
    if (!householdId) { setHousehold(null); setLoading(false); return }
    const unsub = onSnapshot(doc(db, 'households', householdId), (snap) => {
      setHousehold(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      setLoading(false)
    })
    return unsub
  }, [householdId])

  // Adults
  useEffect(() => {
    if (!householdId) return
    const q = query(collection(db, 'adults'), where('householdId', '==', householdId))
    const unsub = onSnapshot(q, (snap) => {
      setAdults(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [householdId])

  // Child (single for now)
  useEffect(() => {
    if (!householdId) return
    const q = query(collection(db, 'children'), where('householdId', '==', householdId))
    const unsub = onSnapshot(q, (snap) => {
      const kids = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setChild(kids[0] || null)
    })
    return unsub
  }, [householdId])

  // Uncollected achievements (for the review)
  useEffect(() => {
    if (!householdId) return
    const q = query(
      collection(db, 'achievements'),
      where('householdId', '==', householdId),
      where('collected', '==', false)
    )
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      items.sort((a, b) => (b.loggedAt?.seconds || 0) - (a.loggedAt?.seconds || 0))
      setAchievements(items)
    })
    return unsub
  }, [householdId])

  // Tonight's prep (today's date)
  useEffect(() => {
    if (!householdId) return
    const today = new Date().toISOString().slice(0, 10)
    const q = query(
      collection(db, 'tonightsPrep'),
      where('householdId', '==', householdId),
      where('date', '==', today)
    )
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setTonightPrep(docs[0] || null)
    })
    return unsub
  }, [householdId])

  return (
    <HouseholdContext.Provider value={{
      household, adults, child, achievements, tonightPrep, loading, householdId
    }}>
      {children}
    </HouseholdContext.Provider>
  )
}

export const useHousehold = () => useContext(HouseholdContext)
