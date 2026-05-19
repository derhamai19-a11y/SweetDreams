import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useHousehold } from '../../contexts/HouseholdContext'
import { uploadPhoto, resizeImage } from '../../utils/storage'
import Page from '../../components/Page'


export default function RewardsSetup() {
  const { householdId, household } = useHousehold()
  const nav = useNavigate()
  const [rewards, setRewards] = useState(household?.rewardsPath || [])
  const [busy, setBusy] = useState(false)

  const update = (i, field, val) => {
    const next = [...rewards]
    next[i] = { ...next[i], [field]: val }
    setRewards(next)
  }

  const remove = (i) => setRewards(rewards.filter((_, idx) => idx !== i))

  const add = () => setRewards([...rewards, {
    id: String(Date.now()), name: '', emoji: '🎁', threshold: 5, unlocked: false
  }])

  const submit = async () => {
    if (rewards.some(r => !r.name.trim())) {
      alert('Each reward needs a name')
      return
    }
    setBusy(true)
    try {
      await updateDoc(doc(db, 'households', householdId), {
        rewardsPath: rewards.map(r => ({
          ...r,
          threshold: Number(r.threshold) || 1,
          unlocked: false,
        })),
      })
      nav('/')
    } catch (e) {
      console.error(e)
      alert('Could not save')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page>
      <div style={{ paddingTop: 40, animation: 'fadeIn 0.5s ease' }}>
        <h1 className="page-title">Rewards path</h1>
        <p className="page-subtitle">
          These light up as your little one earns stars. You can change these anytime — and tweak the thresholds if they're earning too fast or slow.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32 }}>
          {rewards.map((r, i) => (
            <RewardEditor key={r.id} reward={r} index={i} householdId={householdId}
              onChange={(field, val) => update(i, field, val)}
              onRemove={() => remove(i)}
            />
          ))}

          <button onClick={add} className="btn-secondary" style={{ marginTop: 8 }}>
            + Add another reward
          </button>
        </div>

        <button onClick={submit} disabled={busy || rewards.length === 0}
          className="btn-primary" style={{ marginTop: 24, width: '100%' }}>
          {busy ? 'Saving...' : "All done — let's begin"}
        </button>
      </div>
    </Page>
  )
}

function RewardEditor({ reward, index, onChange, onRemove, householdId }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const resized = await resizeImage(file)
      const url = await uploadPhoto(resized, householdId, 'rewards')
      onChange('photoUrl', url)
    } catch (err) {
      console.error(err)
      alert('Could not upload photo. Try again?')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="card" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: 8, left: 16, fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>
        REWARD {index + 1}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 12 }}>

        {/* Icon area: photo or emoji */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          {reward.photoUrl ? (
            <img src={reward.photoUrl} alt={reward.name}
              style={{
                width: 70, height: 70, borderRadius: 12, objectFit: 'cover',
                border: '1px solid var(--border)',
              }}/>
          ) : (
            <input
              type="text"
              value={reward.emoji || ''}
              onChange={e => {
                const chars = [...e.target.value]
                const last = chars[chars.length - 1]
                if (last) onChange('emoji', last)
              }}
              placeholder="🎁"
              style={{
                fontSize: 34, width: 70, height: 70, textAlign: 'center',
                background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          )}
          <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={handlePhoto}/>
          <button onClick={() => reward.photoUrl ? onChange('photoUrl', null) : fileRef.current?.click()}
            style={{ fontSize: 11, color: 'var(--text-soft)', fontWeight: 600 }}>
            {uploading ? '...' : reward.photoUrl ? '✕ photo' : '📷 photo'}
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input className="field-input" value={reward.name}
            onChange={e => onChange('name', e.target.value)}
            placeholder="Reward name"
            style={{ padding: '10px 14px' }}/>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-soft)' }}>Unlock at</span>
            <input type="number" min="1" className="field-input" value={reward.threshold}
              onChange={e => onChange('threshold', e.target.value)}
              style={{ width: 80, padding: '8px 12px' }}/>
            <span style={{ fontSize: 13, color: 'var(--text-soft)' }}>stars</span>
            <button onClick={onRemove} style={{
              marginLeft: 'auto', color: 'var(--rose)', fontSize: 13, fontWeight: 600
            }}>Remove</button>
          </div>
        </div>
      </div>

    </div>
  )
}
