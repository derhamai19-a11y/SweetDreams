import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useHousehold } from '../../contexts/HouseholdContext'
import { uploadPhoto, resizeImage } from '../../utils/storage'
import Page from '../../components/Page'

export default function RewardHistory() {
  const { householdId, household, child } = useHousehold()
  const nav = useNavigate()
  const [earned, setEarned] = useState(null) // null = loading
  const [redeeming, setRedeeming] = useState(null)
  const [editing, setEditing] = useState(null) // reward object being edited
  const autoPopRef = useRef(false)

  // Subscribe to rewardEarned for this household
  useEffect(() => {
    if (!householdId) return
    const q = query(collection(db, 'rewardEarned'), where('householdId', '==', householdId))
    const unsub = onSnapshot(q, snap => {
      setEarned(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [householdId])

  // Auto-populate historical records when cycles have been completed but no records exist yet
  useEffect(() => {
    if (earned === null) return       // still loading
    if (autoPopRef.current) return    // already ran
    if (earned.length > 0) return     // already have records

    const pathCycle = household?.pathCycle || 0
    const path = household?.rewardsPath || []
    if (pathCycle === 0 || path.length === 0) return

    autoPopRef.current = true
    const populate = async () => {
      try {
        const promises = []
        for (let cycle = 1; cycle <= pathCycle; cycle++) {
          path.forEach(r => {
            promises.push(addDoc(collection(db, 'rewardEarned'), {
              householdId,
              childId: child?.id || null,
              name: r.name,
              photoUrl: r.photoUrl || null,
              threshold: r.threshold,
              pathCycle: cycle,
              earnedAt: serverTimestamp(),
              redeemed: false,
              redeemedAt: null,
            }))
          })
        }
        await Promise.all(promises)
      } catch (e) {
        console.error('Auto-populate failed', e)
        autoPopRef.current = false
      }
    }
    populate()
  }, [earned, household?.pathCycle, household?.rewardsPath])

  const redeem = async (earnedId) => {
    setRedeeming(earnedId)
    try {
      await updateDoc(doc(db, 'rewardEarned', earnedId), {
        redeemed: true,
        redeemedAt: serverTimestamp(),
      })
    } catch (e) {
      console.error(e)
      alert('Could not update. Try again?')
    } finally {
      setRedeeming(null)
    }
  }

  const saveEdit = async (id, name, photoUrl) => {
    await updateDoc(doc(db, 'rewardEarned', id), { name, photoUrl: photoUrl || null })
  }

  // Group by pathCycle, sort cycles descending, rewards within cycle ascending by threshold
  const grouped = {}
  if (earned) {
    earned.forEach(e => {
      const cycle = e.pathCycle || 1
      if (!grouped[cycle]) grouped[cycle] = []
      grouped[cycle].push(e)
    })
  }
  const cycleKeys = Object.keys(grouped).map(Number).sort((a, b) => b - a)

  if (earned === null) {
    return (
      <Page>
        <div style={{ paddingTop: 40, textAlign: 'center', color: 'var(--text-soft)' }}>Loading…</div>
      </Page>
    )
  }

  return (
    <Page>
      <div style={{ paddingTop: 24, animation: 'fadeIn 0.5s ease' }}>
        <button onClick={() => nav(-1)} style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 16 }}>← Back</button>

        <h1 className="page-title">Reward history</h1>
        <p className="page-subtitle">
          {cycleKeys.length === 0
            ? `No rewards earned yet — keep collecting stars!`
            : `${child?.name}'s earned rewards · tap Redeem when given`}
        </p>

        {cycleKeys.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🌟</div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Complete a full rewards path<br/>and the earned rewards will appear here.
            </p>
          </div>
        )}

        {cycleKeys.map(cycle => {
          const rewards = grouped[cycle].slice().sort((a, b) => (a.threshold || 0) - (b.threshold || 0))
          const allRedeemed = rewards.every(r => r.redeemed)

          return (
            <div key={cycle} style={{ marginBottom: 32 }}>
              {/* Cycle heading */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{
                  background: allRedeemed ? 'rgba(143,217,196,0.15)' : 'rgba(255,213,132,0.12)',
                  border: `1px solid ${allRedeemed ? '#8FD9C4' : 'rgba(255,213,132,0.5)'}`,
                  borderRadius: 20, padding: '4px 14px',
                  fontSize: 12, fontWeight: 700,
                  color: allRedeemed ? '#8FD9C4' : 'var(--star-gold)',
                  letterSpacing: '0.05em',
                }}>
                  {allRedeemed ? '✓' : '⭐'} CYCLE {cycle}
                </div>
                {allRedeemed && (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>All redeemed</span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {rewards.map(r => (
                  <RewardCard
                    key={r.id}
                    reward={r}
                    onRedeem={() => redeem(r.id)}
                    onEdit={() => setEditing(r)}
                    redeeming={redeeming === r.id}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {editing && (
        <EditSheet
          reward={editing}
          householdId={householdId}
          onSave={async (name, photoUrl) => {
            await saveEdit(editing.id, name, photoUrl)
            setEditing(null)
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </Page>
  )
}

// ─── Reward Card ──────────────────────────────────────────────────────────────

function RewardCard({ reward, onRedeem, onEdit, redeeming }) {
  return (
    <div className="card" style={{
      display: 'flex', alignItems: 'center', gap: 0, padding: 0,
      overflow: 'hidden',
      borderColor: reward.redeemed ? 'rgba(143,217,196,0.25)' : 'rgba(255,213,132,0.22)',
      background: reward.redeemed ? 'rgba(143,217,196,0.05)' : 'rgba(255,213,132,0.04)',
      opacity: reward.redeemed ? 0.7 : 1,
      transition: 'opacity 0.3s ease',
    }}>
      {/* Photo / placeholder */}
      {reward.photoUrl ? (
        <img src={reward.photoUrl} alt={reward.name}
          style={{ width: 80, height: 80, objectFit: 'cover', flexShrink: 0 }}/>
      ) : (
        <div style={{
          width: 80, height: 80, flexShrink: 0,
          background: 'var(--midnight-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36,
        }}>🎁</div>
      )}

      {/* Info */}
      <div style={{ flex: 1, padding: '12px 14px', minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 3 }}>
          AT {reward.threshold} ⭐
        </div>
        <div style={{
          fontFamily: 'var(--display)', fontSize: 17, fontWeight: 500,
          color: reward.redeemed ? 'var(--text-soft)' : 'var(--text)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {reward.name}
        </div>
        {reward.redeemed && (
          <div style={{ fontSize: 11, color: '#8FD9C4', marginTop: 3 }}>✓ Redeemed</div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 14, flexShrink: 0 }}>
        <button onClick={onEdit} style={{
          fontSize: 16, padding: '6px', color: 'var(--text-muted)',
          borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)',
        }}>✏️</button>
        {reward.redeemed ? (
          <div style={{ fontSize: 26 }}>✅</div>
        ) : (
          <button
            onClick={onRedeem}
            disabled={redeeming}
            className="btn-primary"
            style={{ fontSize: 13, padding: '9px 16px', opacity: redeeming ? 0.5 : 1 }}
          >
            {redeeming ? '…' : 'Redeem ✓'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Edit Sheet ───────────────────────────────────────────────────────────────

function EditSheet({ reward, householdId, onSave, onClose }) {
  const [name, setName] = useState(reward.name || '')
  const [photoUrl, setPhotoUrl] = useState(reward.photoUrl || null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const resized = await resizeImage(file)
      const url = await uploadPhoto(resized, householdId, 'rewards')
      setPhotoUrl(url)
    } catch (err) {
      console.error(err)
      alert('Could not upload photo. Try again?')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave(name.trim(), photoUrl)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(7,12,26,0.88)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--midnight-soft)', border: '1px solid var(--border)',
        borderRadius: '20px 20px 0 0', padding: '24px 20px 36px',
        width: '100%', maxWidth: 480, animation: 'slideUp 0.3s ease',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 18, letterSpacing: '0.08em' }}>
          EDIT REWARD · {reward.threshold} ⭐
        </div>

        {/* Photo */}
        <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={handlePhoto}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
            width: 80, height: 80, borderRadius: 12, overflow: 'hidden',
            border: '2px dashed var(--border)', background: 'var(--surface)',
            flexShrink: 0, cursor: 'pointer', padding: 0,
          }}>
            {photoUrl ? (
              <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 4, color: 'var(--text-muted)' }}>
                <span style={{ fontSize: 24 }}>{uploading ? '⏳' : '📷'}</span>
                <span style={{ fontSize: 10, fontWeight: 600 }}>{uploading ? 'Uploading…' : 'Add photo'}</span>
              </div>
            )}
          </button>
          <div style={{ flex: 1 }}>
            {photoUrl && (
              <button onClick={() => setPhotoUrl(null)} style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>
                × Remove photo
              </button>
            )}
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Tap the box to change the photo
            </p>
          </div>
        </div>

        {/* Name */}
        <label className="field-label">Reward name</label>
        <input
          className="field-input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Trip to the cinema"
          style={{ marginTop: 6, marginBottom: 20 }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSave} disabled={saving || !name.trim() || uploading}
            className="btn-primary" style={{ flex: 1, opacity: (saving || !name.trim()) ? 0.5 : 1 }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
