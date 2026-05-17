import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useHousehold } from '../../contexts/HouseholdContext'
import Page from '../../components/Page'

const EMOJI_PICKER = ['🍦','🎁','🌳','🎨','🎪','🍰','🎮','🎭','🚂','⚽','🏊','🎬','🦒','📚','🍕','🎟️']

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
          These light up as your little one earns coins. You can change these anytime — and tweak the thresholds if they're earning too fast or slow.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32 }}>
          {rewards.map((r, i) => (
            <RewardEditor key={r.id} reward={r} index={i} 
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

function RewardEditor({ reward, index, onChange, onRemove }) {
  const [showEmoji, setShowEmoji] = useState(false)
  return (
    <div className="card" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: 8, left: 16, fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>
        REWARD {index + 1}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 12 }}>
        <button onClick={() => setShowEmoji(!showEmoji)} 
          style={{ 
            fontSize: 36, padding: 8, background: 'var(--surface)', 
            borderRadius: 12, border: '1px solid var(--border)',
            width: 70, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
          {reward.emoji}
        </button>
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
            <span style={{ fontSize: 13, color: 'var(--text-soft)' }}>coins</span>
            <button onClick={onRemove} style={{ 
              marginLeft: 'auto', color: 'var(--rose)', fontSize: 13, fontWeight: 600 
            }}>Remove</button>
          </div>
        </div>
      </div>
      
      {showEmoji && (
        <div style={{ 
          marginTop: 12, padding: 12, background: 'var(--midnight-soft)', borderRadius: 12,
          display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4
        }}>
          {EMOJI_PICKER.map(e => (
            <button key={e} onClick={() => { onChange('emoji', e); setShowEmoji(false) }}
              style={{ fontSize: 24, padding: 6, borderRadius: 8 }}>{e}</button>
          ))}
        </div>
      )}
    </div>
  )
}
