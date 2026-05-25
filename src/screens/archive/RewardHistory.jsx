import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useHousehold } from '../../contexts/HouseholdContext'
import Page from '../../components/Page'

export default function RewardHistory() {
  const { householdId, household, child } = useHousehold()
  const nav = useNavigate()
  const [earned, setEarned] = useState(null) // null = loading
  const [redeeming, setRedeeming] = useState(null)
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
        autoPopRef.current = false // allow retry on next render
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
                    redeeming={redeeming === r.id}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Page>
  )
}

function RewardCard({ reward, onRedeem, redeeming }) {
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

      {/* Action */}
      <div style={{ paddingRight: 16, flexShrink: 0 }}>
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
