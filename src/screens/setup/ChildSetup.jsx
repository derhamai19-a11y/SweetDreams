import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useHousehold } from '../../contexts/HouseholdContext'
import { AVATARS } from '../../utils/constants'
import Page from '../../components/Page'

export default function ChildSetup() {
  const { householdId, child } = useHousehold()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [busy, setBusy] = useState(false)

  // If a child already exists, skip
  if (child) {
    nav('/setup/rewards', { replace: true })
    return null
  }

  const submit = async () => {
    if (!name.trim() || !avatar) return
    setBusy(true)
    try {
      await addDoc(collection(db, 'children'), {
        householdId,
        name: name.trim(),
        avatar,
        createdAt: serverTimestamp(),
      })
      nav('/setup/rewards')
    } catch (e) {
      console.error(e)
      alert('Could not save. Try again?')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page>
      <div style={{ paddingTop: 40, animation: 'fadeIn 0.5s ease' }}>
        <h1 className="page-title">Your little one</h1>
        <p className="page-subtitle">What should we call them, and which animal friend would they like?</p>
        
        <div style={{ marginTop: 32 }}>
          <label className="field-label">Their name</label>
          <input className="field-input" value={name} 
            onChange={e => setName(e.target.value)} placeholder="Their name"/>
        </div>
        
        <div style={{ marginTop: 32 }}>
          <label className="field-label">Pick an avatar</label>
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 8
          }}>
            {AVATARS.map(a => (
              <button key={a.id} 
                onClick={() => setAvatar(a.id)}
                className={`kid-tile ${avatar === a.id ? 'selected' : ''}`}
                style={{ minHeight: 86, padding: 12 }}>
                <div style={{ fontSize: 36 }}>{a.emoji}</div>
                <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>{a.label}</div>
              </button>
            ))}
          </div>
        </div>
        
        <button onClick={submit} disabled={busy || !name.trim() || !avatar} 
          className="btn-primary" style={{ marginTop: 32, width: '100%' }}>
          {busy ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </Page>
  )
}
