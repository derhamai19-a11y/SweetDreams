import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../contexts/AuthContext'
import { useHousehold } from '../../contexts/HouseholdContext'
import { CATEGORIES } from '../../utils/constants'
import Page from '../../components/Page'
import PhotoUpload from '../../components/PhotoUpload'

export default function LogAchievement() {
  const { adultProfile } = useAuth()
  const { householdId, child } = useHousehold()
  const nav = useNavigate()
  
  const [category, setCategory] = useState(null)
  const [note, setNote] = useState('')
  const [photoUrl, setPhotoUrl] = useState(null)
  const [coinsValue, setCoinsValue] = useState(1)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!category) return
    setBusy(true)
    try {
      await addDoc(collection(db, 'achievements'), {
        householdId,
        childId: child.id,
        category,
        loggedBy: adultProfile.id,
        loggedByName: adultProfile.name,
        photoUrl: photoUrl || null,
        note: note.trim() || null,
        coinsValue: Number(coinsValue) || 1,
        collected: false,
        loggedAt: serverTimestamp(),
      })
      nav('/')
    } catch (e) {
      console.error(e)
      alert('Could not save. Try again?')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page>
      <div style={{ paddingTop: 24, animation: 'fadeIn 0.5s ease' }}>
        <button onClick={() => nav(-1)} style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 16 }}>← Back</button>
        
        <h1 className="page-title">What did {child?.name} do?</h1>
        <p className="page-subtitle">Pick a category — you can add a photo and note too</p>
        
        <div style={{ marginTop: 28 }}>
          <label className="field-label">Category</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCategory(c.id)}
                className={`kid-tile ${category === c.id ? 'selected' : ''}`}
                style={{ 
                  minHeight: 100, padding: 14, alignItems: 'flex-start', textAlign: 'left',
                  ...(category === c.id ? { 
                    borderColor: c.color, 
                    background: `${c.color}22`,
                    boxShadow: `0 0 0 4px ${c.color}33`,
                  } : {})
                }}>
                <div style={{ fontSize: 28 }}>{c.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{c.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-soft)', lineHeight: 1.3 }}>{c.description}</div>
              </button>
            ))}
          </div>
        </div>
        
        {category && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ marginTop: 28, display: 'flex', gap: 16, alignItems: 'flex-end' }}>
              <PhotoUpload householdId={householdId} folder="achievements" onUploaded={setPhotoUrl} size={90} label="Add photo"/>
              <div style={{ flex: 1 }}>
                <label className="field-label">Note (optional)</label>
                <textarea className="field-input" value={note} 
                  onChange={e => setNote(e.target.value)} 
                  placeholder="What happened?"
                  rows={3}
                  style={{ resize: 'none' }}/>
              </div>
            </div>
            
            <div style={{ marginTop: 24 }}>
              <label className="field-label">Coins to award</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 5].map(n => (
                  <button key={n} onClick={() => setCoinsValue(n)}
                    style={{ 
                      flex: 1, padding: '12px 0', borderRadius: 12,
                      background: coinsValue === n ? 'var(--star-gold)' : 'var(--surface)',
                      color: coinsValue === n ? 'var(--midnight)' : 'var(--text)',
                      fontWeight: 700, fontSize: 16,
                      border: '1px solid ' + (coinsValue === n ? 'var(--star-gold)' : 'var(--border)'),
                    }}>
                    {'⭐'.repeat(n > 3 ? 1 : n)}{n > 3 ? ` ×${n}` : ''}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
                Most things are worth 1. Bump it for something extra special.
              </p>
            </div>
            
            <button onClick={submit} disabled={busy} className="btn-primary" style={{ width: '100%', marginTop: 32 }}>
              {busy ? 'Saving...' : `Log achievement (${adultProfile?.name} noticed)`}
            </button>
          </div>
        )}
      </div>
    </Page>
  )
}
