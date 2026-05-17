import { useEffect, useState } from 'react'
import Page from '../../../components/Page'

export default function PathStep({ next, household }) {
  const [animateIn, setAnimateIn] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const path = household?.rewardsPath || []
  const coins = household?.currentCoins || 0

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <Page>
      <div style={{ paddingTop: 32, paddingBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--display)', fontSize: 36, fontWeight: 500,
          textAlign: 'center', color: 'var(--moon)',
        }}>Your path ✨</h1>
        <p style={{
          textAlign: 'center', color: 'var(--text-soft)', fontSize: 16,
          marginTop: 8, marginBottom: 32,
        }}>Look how many stars you've collected!</p>

        {/* Coin badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,213,132,0.12)', borderRadius: 24,
            padding: '12px 28px',
            border: '2px solid var(--star-gold)',
            boxShadow: '0 0 28px rgba(255,213,132,0.25)',
          }}>
            <span style={{ fontSize: 28 }}>⭐</span>
            <span style={{ fontWeight: 800, fontSize: 26, color: 'var(--star-gold)' }}>{coins}</span>
            <span style={{ fontSize: 15, color: 'var(--text-soft)' }}>coin{coins === 1 ? '' : 's'}</span>
          </div>
        </div>

        {/* Path segments */}
        {path.map((r, i) => {
          const prevThreshold = i === 0 ? 0 : path[i - 1].threshold
          const segmentSize = Math.max(1, r.threshold - prevThreshold)
          const coinsInSegment = Math.max(0, Math.min(coins - prevThreshold, segmentSize))
          const starsFilled = coins >= r.threshold ? 10 : Math.floor((coinsInSegment / segmentSize) * 10)
          const unlocked = coins >= r.threshold

          return (
            <div key={r.id} style={{
              marginBottom: 28,
              animation: animateIn ? `fadeIn 0.5s ease ${i * 0.15}s backwards` : 'none',
            }}>
              {/* 10-star track — each star animates in */}
              <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 14 }}>
                {Array.from({ length: 10 }).map((_, si) => {
                  const filled = animateIn && si < starsFilled
                  return (
                    <span key={si} style={{
                      fontSize: 22,
                      filter: filled ? 'none' : 'grayscale(1) opacity(0.18)',
                      transform: filled ? 'scale(1.1)' : 'scale(1)',
                      transition: `filter 0.35s ease ${si * 0.06}s, transform 0.35s ease ${si * 0.06}s`,
                      display: 'inline-block',
                    }}>⭐</span>
                  )
                })}
              </div>

              {/* Reward card — tappable */}
              <button onClick={() => setExpanded(r)} style={{
                width: '100%', borderRadius: 20, overflow: 'hidden', display: 'block',
                border: `2px solid ${unlocked ? 'var(--star-gold)' : 'rgba(255,244,218,0.12)'}`,
                background: 'none', cursor: 'pointer', textAlign: 'left',
                boxShadow: unlocked ? '0 0 28px rgba(255,213,132,0.35)' : 'none',
              }}>
                <div style={{
                  height: 170, position: 'relative',
                  background: r.photoUrl
                    ? `url(${r.photoUrl}) center/cover`
                    : unlocked
                      ? 'linear-gradient(135deg, rgba(255,213,132,0.3), rgba(255,185,122,0.3))'
                      : 'rgba(255,244,218,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 72,
                  filter: !unlocked ? 'grayscale(0.5) opacity(0.6)' : 'none',
                }}>
                  {!r.photoUrl && r.emoji}
                  {!unlocked && r.photoUrl && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,12,26,0.5)' }}/>
                  )}
                  {unlocked && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(255,213,132,0.08)',
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                      padding: 12,
                    }}>
                      <span style={{
                        background: 'var(--star-gold)', color: 'var(--midnight)',
                        borderRadius: 20, padding: '4px 12px',
                        fontSize: 12, fontWeight: 800, letterSpacing: '0.05em',
                      }}>🌟 UNLOCKED</span>
                    </div>
                  )}
                  <div style={{
                    position: 'absolute', bottom: 8, right: 10,
                    fontSize: 11, color: 'rgba(255,244,218,0.45)',
                  }}>tap to see ↗</div>
                </div>

                <div style={{
                  padding: '13px 18px', background: 'rgba(255,244,218,0.04)',
                }}>
                  <div style={{
                    fontFamily: 'var(--display)', fontSize: 20,
                    color: unlocked ? 'var(--star-gold)' : 'var(--text)',
                  }}>{r.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                    {unlocked
                      ? '🎉 You earned this!'
                      : `${r.threshold - coins} more coin${r.threshold - coins === 1 ? '' : 's'} to unlock`}
                  </div>
                </div>
              </button>
            </div>
          )
        })}

        <button onClick={next} className="btn-primary" style={{
          width: '100%', marginTop: 8, fontSize: 18,
        }}>
          Keep going ✨
        </button>
      </div>

      {/* Reward lightbox */}
      {expanded && (
        <div onClick={() => setExpanded(null)} style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(7,12,26,0.97)', backdropFilter: 'blur(16px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 24, animation: 'fadeIn 0.2s ease',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 340, animation: 'scaleIn 0.3s ease',
          }}>
            <div style={{
              borderRadius: 24, overflow: 'hidden',
              border: `3px solid ${coins >= expanded.threshold ? 'var(--star-gold)' : 'rgba(255,244,218,0.15)'}`,
              boxShadow: coins >= expanded.threshold ? '0 0 60px rgba(255,213,132,0.5)' : 'none',
            }}>
              <div style={{
                height: 320,
                background: expanded.photoUrl
                  ? `url(${expanded.photoUrl}) center/cover`
                  : coins >= expanded.threshold
                    ? 'linear-gradient(135deg, var(--star-gold), var(--star-warm))'
                    : 'var(--midnight-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 100,
              }}>
                {!expanded.photoUrl && expanded.emoji}
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 28, fontWeight: 500, color: 'var(--moon)' }}>
                {expanded.name}
              </div>
              <div style={{
                fontSize: 16, marginTop: 8,
                color: coins >= expanded.threshold ? 'var(--star-gold)' : 'var(--text-soft)',
              }}>
                {coins >= expanded.threshold
                  ? '🌟 You unlocked this!'
                  : `${expanded.threshold - coins} more coin${expanded.threshold - coins === 1 ? '' : 's'} needed`}
              </div>
              <button onClick={() => setExpanded(null)} className="btn-secondary" style={{ width: '100%', marginTop: 20 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  )
}
