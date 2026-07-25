import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { doc, updateDoc, deleteField } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useHousehold } from '../../contexts/HouseholdContext'
import Page from '../../components/Page'

export default function RewardChooser() {
  const { householdId, household, child } = useHousehold()
  const nav = useNavigate()

  const draft = household?.rewardDraft
  const milestones = (draft?.milestones || []).filter(m =>
    m.options?.some(o => o.name?.trim() || o.photoUrl)
  )

  const [stepIndex, setStepIndex] = useState(0)
  const [selections, setSelections] = useState([null, null, null]) // one per milestone
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  // Auto-select if only one valid option for this step
  useEffect(() => {
    if (!milestones[stepIndex]) return
    const valid = milestones[stepIndex].options.filter(o => o.name?.trim() || o.photoUrl)
    if (valid.length === 1 && !selections[stepIndex]) {
      setSelections(prev => {
        const next = [...prev]
        next[stepIndex] = valid[0]
        return next
      })
    }
  }, [stepIndex, milestones.length])

  // Guard — needs a ready draft
  if (!draft?.readyForChoice || milestones.length === 0) {
    return <Navigate to="/" replace />
  }

  const current = milestones[stepIndex]
  const validOptions = current.options.filter(o => o.name?.trim() || o.photoUrl)
  const selected = selections[stepIndex]
  const isLast = stepIndex === milestones.length - 1
  const canContinue = !!selected || validOptions.length <= 1

  const pick = (opt) => {
    setSelections(prev => {
      const next = [...prev]
      next[stepIndex] = opt
      return next
    })
  }

  const advance = async () => {
    // Ensure something is selected (auto-select first option if needed)
    if (!selections[stepIndex] && validOptions.length > 0) {
      const auto = [...selections]
      auto[stepIndex] = validOptions[0]
      setSelections(auto)
    }

    if (!isLast) {
      setStepIndex(i => i + 1)
      return
    }

    // Final step — save
    setSubmitting(true)
    try {
      const finalSelections = [...selections]
      if (!finalSelections[stepIndex] && validOptions.length > 0) {
        finalSelections[stepIndex] = validOptions[0]
      }

      const rewardsPath = milestones.map((m, i) => {
        const sel = finalSelections[i]
        const opt = sel || m.options.find(o => o.name?.trim() || o.photoUrl) || m.options[0]
        return {
          id: opt.id,
          name: opt.name || 'Reward',
          photoUrl: opt.photoUrl || null,
          threshold: m.threshold,
        }
      })

      await updateDoc(doc(db, 'households', householdId), {
        rewardsPath,
        rewardDraft: deleteField(),
      })
      setDone(true)
    } catch (e) {
      console.error(e)
      alert('Could not save. Try again?')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Celebration screen ────────────────────────────────────────────────────
  if (done) {
    const savedPath = milestones.map((m, i) => {
      const sel = selections[i] || m.options.find(o => o.name?.trim()) || m.options[0]
      return { name: sel?.name || 'Reward', threshold: m.threshold }
    })

    return (
      <Page>
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          padding: '40px 24px',
        }}>
          <div style={{ fontSize: 80, animation: 'float 3s ease-in-out infinite',
            filter: 'drop-shadow(0 0 24px rgba(255,213,132,0.5))' }}>🌟</div>

          <h1 style={{ fontFamily: 'var(--display)', fontSize: 40, fontWeight: 500,
            marginTop: 24, color: 'var(--moon)' }}>
            Rewards locked in!
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-soft)', marginTop: 8, marginBottom: 28 }}>
            Here's what you're working towards…
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320 }}>
            {savedPath.map(r => (
              <div key={r.threshold} className="card" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                borderColor: 'rgba(255,213,132,0.3)',
                background: 'rgba(255,213,132,0.06)',
              }}>
                <span style={{ fontSize: 20 }}>⭐</span>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>AT {r.threshold} STARS</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--star-gold)' }}>{r.name}</div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => nav('/')} className="btn-primary"
            style={{ marginTop: 32, fontSize: 18, padding: '18px 48px' }}>
            Let's go! ✨
          </button>
        </div>
      </Page>
    )
  }

  // ── Main chooser screen ───────────────────────────────────────────────────
  return (
    <Page>
      <div style={{ animation: 'fadeIn 0.4s ease' }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', paddingTop: 28, paddingBottom: 4 }}>
          {milestones.map((_, i) => (
            <div key={i} style={{
              width: i === stepIndex ? 22 : 8, height: 8, borderRadius: 4,
              background: i <= stepIndex ? 'var(--star-gold)' : 'var(--border)',
              transition: 'all 0.3s ease',
            }}/>
          ))}
        </div>

        <div style={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', paddingTop: 16, paddingBottom: 48,
        }}>
          {/* Heading */}
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            {current.threshold} stars
          </p>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 30, fontWeight: 500,
            textAlign: 'center', color: 'var(--moon)', marginBottom: 6 }}>
            {validOptions.length > 1
              ? `What's your ${current.threshold} ⭐ reward?`
              : `Your ${current.threshold} ⭐ reward`}
          </h1>
          {validOptions.length > 1 && (
            <p style={{ fontSize: 15, color: 'var(--text-soft)', marginBottom: 24 }}>
              Pick the one you want most!
            </p>
          )}

          {/* Option cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: validOptions.length === 1 ? 'minmax(0, 340px)' : '1fr 1fr',
            gap: 14, width: '100%', marginBottom: 28,
          }}>
            {validOptions.map(opt => {
              const isSelected = selected?.id === opt.id
              return (
                <button key={opt.id} onClick={() => pick(opt)}
                  style={{
                    borderRadius: 20, overflow: 'hidden', padding: 0,
                    border: `3px solid ${isSelected ? 'var(--star-gold)' : 'var(--border)'}`,
                    background: isSelected ? 'rgba(255,213,132,0.07)' : 'var(--surface)',
                    boxShadow: isSelected ? '0 0 28px rgba(255,213,132,0.35)' : 'none',
                    transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                  }}>
                  {/* Photo */}
                  {opt.photoUrl ? (
                    <img src={opt.photoUrl} alt={opt.name}
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}/>
                  ) : (
                    <div style={{
                      width: '100%', aspectRatio: '1',
                      background: 'var(--midnight-soft)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52,
                    }}>🎁</div>
                  )}
                  {/* Name */}
                  <div style={{
                    padding: '12px 10px', textAlign: 'center',
                    borderTop: `1px solid ${isSelected ? 'rgba(255,213,132,0.3)' : 'var(--border)'}`,
                  }}>
                    <div style={{ fontFamily: 'var(--display)', fontSize: 16, fontWeight: 500,
                      color: isSelected ? 'var(--star-gold)' : 'var(--text)' }}>
                      {opt.name || 'Reward'}
                    </div>
                    {isSelected && <div style={{ fontSize: 16, marginTop: 4 }}>⭐</div>}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Continue button */}
          <button onClick={advance} disabled={submitting || !canContinue}
            className="btn-primary"
            style={{
              width: '100%', fontSize: 18, padding: '18px',
              opacity: canContinue ? 1 : 0.4,
            }}>
            {submitting ? 'Saving…' : isLast ? 'Done! 🌟' : 'Next →'}
          </button>
        </div>
      </div>
    </Page>
  )
}
