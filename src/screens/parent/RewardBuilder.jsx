import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../contexts/AuthContext'
import { useHousehold } from '../../contexts/HouseholdContext'
import { uploadPhoto, resizeImage } from '../../utils/storage'
import Page from '../../components/Page'

const MILESTONE_META = [
  { threshold: 10, label: '10 ⭐ reward', accent: '#8FD9C4' },
  { threshold: 20, label: '20 ⭐ reward', accent: '#B19CD9' },
  { threshold: 30, label: '30 ⭐ reward', accent: '#FFD584' },
]

function emptySlot(seed) {
  return { id: `slot_${seed}_${Math.random().toString(36).slice(2, 7)}`, name: '', photoUrl: null }
}

function buildDefaultMilestones() {
  return MILESTONE_META.map(m => ({
    threshold: m.threshold,
    options: [emptySlot(m.threshold + 'a'), emptySlot(m.threshold + 'b')],
  }))
}

export default function RewardBuilder() {
  const { adultProfile } = useAuth()
  const { householdId, household, child } = useHousehold()
  const nav = useNavigate()

  const [milestones, setMilestones] = useState(() => {
    const draft = household?.rewardDraft?.milestones
    if (Array.isArray(draft) && draft.length === MILESTONE_META.length) return draft
    return buildDefaultMilestones()
  })

  const [busy, setBusy] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(null) // { mi, oi } | null
  const history = household?.rewardHistory || []

  const isAdmin = adultProfile?.role === 'admin'

  const patchOption = (mi, oi, patch) => {
    setMilestones(prev => prev.map((m, i) =>
      i !== mi ? m : {
        ...m,
        options: m.options.map((o, j) => j !== oi ? o : { ...o, ...patch }),
      }
    ))
  }

  const sendToChild = async () => {
    for (let i = 0; i < milestones.length; i++) {
      const hasOption = milestones[i].options.some(o => o.name.trim())
      if (!hasOption) {
        alert(`Please add at least one named option for the ${MILESTONE_META[i].label} milestone`)
        return
      }
    }
    setBusy(true)
    try {
      // Collect new history entries (photo + named options not already in history)
      const existingUrls = new Set((household?.rewardHistory || []).map(h => h.photoUrl))
      const newEntries = milestones
        .flatMap(m => m.options)
        .filter(o => o.photoUrl && o.name.trim() && !existingUrls.has(o.photoUrl))
        .map(o => ({ id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, name: o.name.trim(), photoUrl: o.photoUrl }))
      const updatedHistory = [...newEntries, ...(household?.rewardHistory || [])].slice(0, 20)

      await updateDoc(doc(db, 'households', householdId), {
        rewardDraft: { readyForChoice: true, milestones },
        rewardHistory: updatedHistory,
      })
      nav('/rewards/choose')
    } catch (e) {
      console.error(e)
      alert('Could not save. Try again?')
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
            Only family admins can build rewards.
          </p>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <div style={{ paddingTop: 24, animation: 'fadeIn 0.5s ease' }}>
        <button onClick={() => nav(-1)} style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 16 }}>← Back</button>

        <h1 className="page-title">Build rewards path</h1>
        <p className="page-subtitle">
          Give {child?.name || 'them'} two choices for each milestone — they'll pick their favourite
        </p>

        {milestones.map((m, mi) => {
          const meta = MILESTONE_META[mi]
          return (
            <div key={m.threshold} style={{ marginTop: 28 }}>
              {/* Milestone heading */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: meta.accent, flexShrink: 0 }}/>
                <h3 style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 500, color: meta.accent }}>
                  {meta.label}
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {m.options.map((opt, oi) => (
                  <OptionSlot
                    key={opt.id}
                    option={opt}
                    accent={meta.accent}
                    householdId={householdId}
                    hasHistory={history.length > 0}
                    onChange={patch => patchOption(mi, oi, patch)}
                    onOpenHistory={() => setHistoryOpen({ mi, oi })}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {/* Past rewards library */}
        {history.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontFamily: 'var(--display)', fontSize: 18, marginBottom: 4 }}>Past rewards</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              Tap "From history" on any slot to reuse these
            </p>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
              {history.map(h => (
                <div key={h.id} style={{ flexShrink: 0, textAlign: 'center', width: 72 }}>
                  <img src={h.photoUrl} alt={h.name}
                    style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border)' }}/>
                  <div style={{ fontSize: 10, color: 'var(--text-soft)', marginTop: 4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {h.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={sendToChild} disabled={busy}
          className="btn-primary"
          style={{ width: '100%', marginTop: 32, marginBottom: 24, fontSize: 18, padding: '18px' }}>
          {busy ? 'Saving...' : `Let ${child?.name || 'them'} choose! 🌟`}
        </button>
      </div>

      {/* History picker sheet */}
      {historyOpen && (
        <HistorySheet
          history={history}
          onSelect={entry => {
            patchOption(historyOpen.mi, historyOpen.oi, { name: entry.name, photoUrl: entry.photoUrl })
            setHistoryOpen(null)
          }}
          onClose={() => setHistoryOpen(null)}
        />
      )}
    </Page>
  )
}

// ─── Option Slot ───────────────────────────────────────────────────────────────

function OptionSlot({ option, accent, householdId, hasHistory, onChange, onOpenHistory }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const resized = await resizeImage(file)
      const url = await uploadPhoto(resized, householdId, 'rewards')
      onChange({ photoUrl: url })
    } catch (err) {
      console.error(err)
      const code = err?.code || ''
      if (code.includes('unauthorized') || code.includes('permission')) {
        alert('Upload failed: permission denied. Check Firebase Storage rules.')
      } else {
        alert('Could not upload photo. Try again?')
      }
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const isEmpty = !option.name.trim() && !option.photoUrl

  return (
    <div className="card" style={{ padding: 10, opacity: isEmpty ? 0.75 : 1, transition: 'opacity 0.2s' }}>
      {/* Photo area */}
      <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={handlePhoto}/>

      {option.photoUrl ? (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1' }}>
          <img src={option.photoUrl} alt={option.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10, display: 'block' }}/>
          <button onClick={() => onChange({ photoUrl: null })} style={{
            position: 'absolute', top: 4, right: 4,
            width: 24, height: 24, borderRadius: '50%',
            background: 'rgba(0,0,0,0.65)', color: 'white',
            fontSize: 14, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>
      ) : (
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
          width: '100%', aspectRatio: '1', borderRadius: 10,
          background: `${accent}18`,
          border: `2px dashed ${accent}55`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 4, color: accent, cursor: 'pointer',
        }}>
          <span style={{ fontSize: 26 }}>{uploading ? '⏳' : '📷'}</span>
          <span style={{ fontSize: 11, fontWeight: 600 }}>{uploading ? 'Uploading…' : 'Add photo'}</span>
        </button>
      )}

      {/* Name input */}
      <input className="field-input" value={option.name}
        onChange={e => onChange({ name: e.target.value })}
        placeholder="Reward name"
        style={{ marginTop: 8, fontSize: 13, padding: '6px 10px' }}
      />

      {/* From history */}
      {hasHistory && (
        <button onClick={onOpenHistory}
          style={{ fontSize: 11, color: accent, marginTop: 6, fontWeight: 600, display: 'block' }}>
          📖 From history
        </button>
      )}
    </div>
  )
}

// ─── History bottom-sheet ──────────────────────────────────────────────────────

function HistorySheet({ history, onSelect, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(7,12,26,0.88)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--midnight-soft)', border: '1px solid var(--border)',
        borderRadius: '20px 20px 0 0', padding: '20px 20px 32px',
        width: '100%', maxWidth: 480, animation: 'slideUp 0.3s ease',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14, letterSpacing: '0.08em' }}>
          PAST REWARDS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
          {history.map(h => (
            <button key={h.id} onClick={() => onSelect(h)} style={{
              display: 'flex', gap: 12, alignItems: 'center', padding: 10,
              borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)',
              textAlign: 'left',
            }}>
              <img src={h.photoUrl} alt={h.name}
                style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}/>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{h.name}</span>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="btn-secondary" style={{ width: '100%', marginTop: 14 }}>
          Cancel
        </button>
      </div>
    </div>
  )
}
