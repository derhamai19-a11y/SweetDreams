import { useEffect, useState } from 'react'
import Page from '../../../components/Page'

export default function PathStep({ next, household }) {
  const [animateIn, setAnimateIn] = useState(false)
  const path = household?.rewardsPath || []
  const coins = household?.currentCoins || 0
  
  const totalThreshold = path[path.length - 1]?.threshold || 1
  const progress = Math.min(coins / totalThreshold, 1)
  
  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 200)
    return () => clearTimeout(t)
  }, [])

  return (
    <Page>
      <div style={{ paddingTop: 32, paddingBottom: 32 }}>
        <h1 style={{ 
          fontFamily: 'var(--display)', fontSize: 36, fontWeight: 500,
          textAlign: 'center', color: 'var(--moon)',
        }}>
          Your path
        </h1>
        <p style={{ 
          textAlign: 'center', color: 'var(--text-soft)', fontSize: 16, 
          marginTop: 8, marginBottom: 48,
        }}>
          Look how far you've come ⭐
        </p>

        {/* Vertical path */}
        <div style={{ position: 'relative', padding: '0 20px' }}>
          {/* Track */}
          <div style={{ 
            position: 'absolute', left: '50%', top: 0, bottom: 0, 
            width: 6, marginLeft: -3, 
            background: 'rgba(255,244,218,0.08)',
            borderRadius: 3,
          }}/>
          
          {/* Filled portion */}
          <div style={{ 
            position: 'absolute', left: '50%', top: 0, 
            width: 6, marginLeft: -3, 
            background: 'linear-gradient(180deg, var(--star-gold), var(--star-warm))',
            borderRadius: 3,
            height: animateIn ? `${progress * 100}%` : '0%',
            transition: 'height 1.5s ease',
            boxShadow: '0 0 12px rgba(255,213,132,0.6)',
          }}/>

          {/* Rewards along path */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36, position: 'relative' }}>
            {path.map((r, i) => {
              const unlocked = coins >= r.threshold
              return (
                <div key={r.id} style={{ 
                  display: 'flex', alignItems: 'center', gap: 18,
                  flexDirection: i % 2 === 0 ? 'row' : 'row-reverse',
                  animation: animateIn ? `fadeIn 0.5s ease ${i * 0.2}s backwards` : 'none',
                }}>
                  <div style={{ flex: 1, textAlign: i % 2 === 0 ? 'right' : 'left' }}>
                    <div style={{ 
                      fontFamily: 'var(--display)', fontSize: 20, fontWeight: 500,
                      color: unlocked ? 'var(--star-gold)' : 'var(--text-soft)',
                    }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {unlocked ? '✓ Unlocked!' : `${r.threshold - coins} more`}
                    </div>
                  </div>
                  
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: r.photoUrl
                      ? `url(${r.photoUrl}) center/cover`
                      : unlocked
                        ? 'linear-gradient(135deg, var(--star-gold), var(--star-warm))'
                        : 'var(--surface)',
                    border: unlocked ? '3px solid var(--star-gold)' : '3px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 32,
                    boxShadow: unlocked ? '0 0 24px rgba(255,213,132,0.6)' : 'none',
                    transition: 'all 1s ease',
                    transitionDelay: `${i * 0.2}s`,
                    position: 'relative', zIndex: 1,
                    filter: !unlocked ? 'grayscale(0.6) opacity(0.5)' : 'none',
                    overflow: 'hidden',
                  }}>{!r.photoUrl && r.emoji}</div>
                  
                  <div style={{ flex: 1 }}/>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ 
          textAlign: 'center', marginTop: 32, padding: '14px 20px',
          background: 'var(--surface)', borderRadius: 20, display: 'inline-flex',
          alignItems: 'center', gap: 10, marginLeft: '50%', transform: 'translateX(-50%)',
          border: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: 24 }}>⭐</span>
          <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--star-gold)' }}>
            {coins} coin{coins === 1 ? '' : 's'}
          </span>
        </div>

        <button onClick={next} className="btn-primary" style={{ 
          width: '100%', marginTop: 32, fontSize: 18,
        }}>
          Keep going ✨
        </button>
      </div>
    </Page>
  )
}
