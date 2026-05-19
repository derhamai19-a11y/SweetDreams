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
  const [emoji, setEmoji] = useState(null)
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
        emoji: emoji || null,
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
        <p className="page-subtitle">Add a photo or sticker, then pick a category</p>

        {/* Photo + emoji — always visible */}
        <div style={{ marginTop: 24, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <PhotoUpload
              householdId={householdId}
              folder="achievements"
              onUploaded={(url) => { setPhotoUrl(url); setEmoji(null) }}
              size={90}
              label="Add photo"
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>PHOTO</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <input
              type="text"
              value={emoji || ''}
              onChange={e => {
                const chars = [...e.target.value]
                const last = chars[chars.length - 1] || null
                setEmoji(last)
                if (last) setPhotoUrl(null)
              }}
              placeholder="🌟"
              style={{
                width: 90, height: 90, borderRadius: '50%', textAlign: 'center',
                background: 'var(--surface)', color: 'var(--text)',
                border: emoji ? '2px solid var(--star-gold)' : '2px dashed var(--border)',
                fontSize: 44,
              }}
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>STICKER</span>
          </div>

          <div style={{ flex: 1 }}>
            <label className="field-label">Note (optional)</label>
            <textarea className="field-input" value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="What happened?"
              rows={4}
              style={{ resize: 'none', marginTop: 6 }}/>
          </div>
        </div>

        {/* Category */}
        <div style={{ marginTop: 28 }}>
          <label className="field-label">Category</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 8 }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCategory(c.id)}
                className={`kid-tile ${category === c.id ? 'selected' : ''}`}
                style={{
                  minHeight: 90, padding: 14, alignItems: 'flex-start', textAlign: 'left',
                  ...(category === c.id ? {
                    borderColor: c.color,
                    background: `${c.color}22`,
                    boxShadow: `0 0 0 4px ${c.color}33`,
                  } : {})
                }}>
                <div style={{ fontSize: 26 }}>{c.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{c.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-soft)', lineHeight: 1.3 }}>{c.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Stars */}
        <div style={{ marginTop: 24 }}>
          <label className="field-label">Stars to award</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
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
            Most things earn 1 star. Bump it for something extra special.
          </p>
        </div>

        <button onClick={submit} disabled={busy || !category}
          className="btn-primary" style={{ width: '100%', marginTop: 32, marginBottom: 24 }}>
          {busy ? 'Saving...' : `Log achievement (${adultProfile?.name} noticed)`}
        </button>
      </div>
    </Page>
  )
}
