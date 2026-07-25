import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useHousehold } from '../../contexts/HouseholdContext'
import { AVATARS } from '../../utils/constants'
import Page from '../../components/Page'
import PhotoUpload from '../../components/PhotoUpload'

export default function ChildSetup() {
  const { householdId, child } = useHousehold()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [photoUrl, setPhotoUrl] = useState(null)
  const [busy, setBusy] = useState(false)

  // If a child already exists, skip
  if (child) {
    nav('/setup/rewards', { replace: true })
    return null
  }

  const canSubmit = name.trim() && (photoUrl || avatar)

  const submit = async () => {
    if (!canSubmit) return
    setBusy(true)
    try {
      await addDoc(collection(db, 'children'), {
        householdId,
        name: name.trim(),
        avatar: avatar || null,
        photoUrl: photoUrl || null,
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
        <p className="page-subtitle">Add their name, a photo, or pick an animal friend</p>

        <div style={{ marginTop: 32 }}>
          <label className="field-label">Their name</label>
          <input className="field-input" value={name}
            onChange={e => setName(e.target.value)} placeholder="Their name"/>
        </div>

        <div style={{ marginTop: 32 }}>
          <label className="field-label">Their photo</label>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <PhotoUpload
              householdId={householdId}
              folder="children"
              onUploaded={setPhotoUrl}
              size={100}
              label="Add photo"
            />
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <label className="field-label">Or pick an animal friend</label>
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

        <button onClick={submit} disabled={busy || !canSubmit}
          className="btn-primary" style={{ marginTop: 32, width: '100%' }}>
          {busy ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </Page>
  )
}
