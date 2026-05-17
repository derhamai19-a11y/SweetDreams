import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../contexts/AuthContext'
import { useHousehold } from '../../contexts/HouseholdContext'
import { uploadPhoto, resizeImage } from '../../utils/storage'
import Page from '../../components/Page'

const EMOJI_PICKER = ['🍦','🎁','🌳','🎨','🎪','🍰','🎮','🎭','🚂','⚽','🏊','🎬','🦒','📚','🍕','🎟️','🦖','🚀','🐶','🍪']

export default function RewardsManager() {
  const { adultProfile } = useAuth()
  const { householdId, household } = useHousehold()
  const nav = useNavigate()
  const isAdmin = adultProfile?.role === 'admin'

  const [rewards, setRewards] = useState([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setRewards(household?.rewardsPath || [])
  }, [household])

  const update = (i, field, val) => {
    const next = [...rewards]
    next[i] = { ...next[i], [field]: val }
    setRewards(next)
  }

  const remove = (i) => setRewards(rewards.filter((_, idx) => idx !== i))

  const add = () => setRewards([...rewards, {
    id: String(Date.now()), name: '', emoji: '🎁', threshold: 5, unlocked: false
  }])

  const move = (i, dir) => {
    const next = [...rewards]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    setRewards(next)
  }

  const save = async () => {
    if (rewards.some(r => !r.name.trim())) {
      alert('Each reward needs a name')
      return
    }
    setBusy(true)
    try {
      await updateDoc(doc(db, 'households', householdId), {
        rewardsPath: rewards.map(r => ({
          ...r, threshold: Number(r.threshold) || 1
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

  if (!isAdmin) {
    return (
      <Page>
        <div style={{ paddingTop: 40 }}>
          <button onClick={() => nav(-1)} style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 16 }}>← Back</button>
          <p style={{ color: 'var(--text-soft)', textAlign: 'center', marginTop: 40 }}>
            Only family admins can edit rewards.
          </p>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <div style={{ paddingTop: 24, animation: 'fadeIn 0.5s ease' }}>
        <button onClick={() => nav(-1)} style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 16 }}>← Back</button>

        <h1 className="page-title">Rewards path</h1>
        <p className="page-subtitle">
          {household?.currentCoins || 0} coins earned so far. Adjust thresholds if needed.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 28 }}>
          {rewards.map((r, i) => (
            <RewardCard key={r.id} reward={r} index={i} total={rewards.length} householdId={householdId}
              currentCoins={household?.currentCoins || 0}
              onChange={(f, v) => update(i, f, v)}
              onRemove={() => remove(i)}
              onMoveUp={() => move(i, -1)}
              onMoveDown={() => move(i, 1)}
            />
          ))}

          <button onClick={add} className="btn-secondary">+ Add reward</button>
        </div>

        <button onClick={save} disabled={busy || rewards.length === 0}
          className="btn-primary" style={{ width: '100%', marginTop: 24, marginBottom: 24 }}>
          {busy ? 'Saving...' : 'Save'}
        </button>
      </div>
    </Page>
  )
}

function RewardCard({ reward, index, total, currentCoins, onChange, onRemove, onMoveUp, onMoveDown, householdId }) {
  const [showEmoji, setShowEmoji] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)
  const reached = currentCoins >= reward.threshold

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const resized = await resizeImage(file)
      const url = await uploadPhoto(resized, householdId, 'rewards')
      onChange('photoUrl', url)
      setShowEmoji(false)
    } catch (err) {
      console.error(err)
      alert('Could not upload photo. Try again?')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="card" style={{
      ...(reached ? { borderColor: 'var(--star-gold)', background: 'rgba(255,213,132,0.06)' } : {})
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>

        {/* Icon area: photo or emoji */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          {reward.photoUrl ? (
            <div style={{
              width: 60, height: 60, borderRadius: 12,
              background: `url(${reward.photoUrl}) center/cover`,
              border: '1px solid var(--border)',
            }}/>
          ) : (
            <button onClick={() => setShowEmoji(!showEmoji)} style={{
              fontSize: 32, width: 60, height: 60,
              background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{reward.emoji}</button>
          )}
          <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={handlePhoto}/>
          <button onClick={() => reward.photoUrl ? onChange('photoUrl', null) : fileRef.current?.click()}
            style={{ fontSize: 11, color: 'var(--text-soft)', fontWeight: 600 }}>
            {uploading ? '...' : reward.photoUrl ? '✕ photo' : '📷 photo'}
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input className="field-input" value={reward.name}
            onChange={e => onChange('name', e.target.value)} placeholder="Reward name"
            style={{ padding: '8px 12px' }}/>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>at</span>
            <input type="number" min="1" className="field-input" value={reward.threshold}
              onChange={e => onChange('threshold', e.target.value)}
              style={{ width: 60, padding: '6px 10px' }}/>
            <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>coins</span>
            {reached && <span style={{ fontSize: 11, color: 'var(--star-gold)', fontWeight: 700, marginLeft: 'auto' }}>✓ Unlocked</span>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button onClick={onMoveUp} disabled={index === 0} style={{
            opacity: index === 0 ? 0.3 : 1, fontSize: 12, padding: 4
          }}>▲</button>
          <button onClick={onMoveDown} disabled={index === total - 1} style={{
            opacity: index === total - 1 ? 0.3 : 1, fontSize: 12, padding: 4
          }}>▼</button>
        </div>
      </div>

      <button onClick={onRemove} style={{
        marginTop: 8, fontSize: 12, color: 'var(--rose)', fontWeight: 600
      }}>Remove</button>

      {showEmoji && (
        <div style={{
          marginTop: 12, padding: 10, background: 'var(--midnight-soft)', borderRadius: 10,
          display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4
        }}>
          {EMOJI_PICKER.map(e => (
            <button key={e} onClick={() => { onChange('emoji', e); setShowEmoji(false) }}
              style={{ fontSize: 22, padding: 4 }}>{e}</button>
          ))}
        </div>
      )}
    </div>
  )
}
