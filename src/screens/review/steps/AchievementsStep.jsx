import { useState } from 'react'
import { CATEGORY_MAP } from '../../../utils/constants'
import Page from '../../../components/Page'

export default function AchievementsStep({ achievements, child, onCompleteAchievements }) {
  const [collected, setCollected] = useState([])
  const [showingDetail, setShowingDetail] = useState(null)
  const [coinsFlying, setCoinsFlying] = useState(false)
  
  if (!achievements || achievements.length === 0) {
    return (
      <Page>
        <div style={{ 
          minHeight: '100vh', display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center',
        }}>
          <div style={{ fontSize: 80 }}>🌙</div>
          <h2 style={{ fontFamily: 'var(--display)', fontSize: 28, marginTop: 24 }}>
            No new achievements tonight
          </h2>
          <p style={{ color: 'var(--text-soft)', marginTop: 8 }}>That's ok — let's keep going</p>
          <button onClick={onCompleteAchievements} className="btn-primary" style={{ marginTop: 32 }}>
            Continue
          </button>
        </div>
      </Page>
    )
  }

  const handleCollect = (a) => {
    if (collected.includes(a.id)) return
    setShowingDetail(a)
  }

  const closeDetail = () => {
    if (showingDetail) {
      setCollected([...collected, showingDetail.id])
      setCoinsFlying(true)
      setTimeout(() => setCoinsFlying(false), 1200)
    }
    setShowingDetail(null)
  }

  const allCollected = collected.length === achievements.length

  return (
    <Page>
      <div style={{ paddingTop: 24, paddingBottom: 24 }}>
        <h1 style={{ 
          fontFamily: 'var(--display)', fontSize: 36, fontWeight: 500,
          textAlign: 'center', color: 'var(--moon)',
        }}>
          Look what we noticed
        </h1>
        <p style={{ 
          textAlign: 'center', color: 'var(--text-soft)', fontSize: 16, 
          marginTop: 8, marginBottom: 32,
        }}>
          Tap each one to open it ✨
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {achievements.map(a => {
            const cat = CATEGORY_MAP[a.category]
            const isCollected = collected.includes(a.id)
            return (
              <button key={a.id} onClick={() => handleCollect(a)}
                disabled={isCollected}
                style={{ 
                  position: 'relative',
                  minHeight: 130, padding: 16,
                  background: isCollected 
                    ? 'rgba(255,244,218,0.04)' 
                    : `linear-gradient(135deg, ${cat?.color}33, ${cat?.color}11)`,
                  border: '2px solid ' + (isCollected ? 'var(--border)' : cat?.color + '66'),
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'all 0.3s',
                  opacity: isCollected ? 0.4 : 1,
                  cursor: isCollected ? 'default' : 'pointer',
                  animation: !isCollected ? 'float 3s ease-in-out infinite' : 'none',
                  animationDelay: `${Math.random() * 1}s`,
                }}>
                {isCollected && <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 18 }}>✓</div>}
                <div style={{ fontSize: 44 }}>{isCollected ? '📭' : '🎁'}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{cat?.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>from {a.loggedByName}</div>
              </button>
            )
          })}
        </div>

        {allCollected && (
          <button onClick={onCompleteAchievements} className="btn-primary" style={{ 
            width: '100%', marginTop: 32, fontSize: 18, animation: 'fadeIn 0.5s ease',
          }}>
            See my path ✨
          </button>
        )}
      </div>

      {/* Detail modal */}
      {showingDetail && (
        <AchievementDetail achievement={showingDetail} onClose={closeDetail} child={child}/>
      )}

      {coinsFlying && <CoinShower count={showingDetail?.coinsValue || 1}/>}
    </Page>
  )
}

function AchievementDetail({ achievement, onClose, child }) {
  const cat = CATEGORY_MAP[achievement.category]
  return (
    <div onClick={onClose} style={{ 
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(15,23,41,0.92)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'fadeIn 0.3s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: `linear-gradient(180deg, ${cat?.color}22, var(--midnight))`,
        border: `2px solid ${cat?.color}`,
        borderRadius: 'var(--radius-xl)', padding: 32,
        width: '100%', maxWidth: 380,
        textAlign: 'center',
        animation: 'scaleIn 0.4s ease',
        boxShadow: `0 20px 60px ${cat?.color}44`,
      }}>
        <div style={{ fontSize: 72, marginBottom: 12 }}>{cat?.emoji}</div>
        <h2 style={{ fontFamily: 'var(--display)', fontSize: 32, color: cat?.color, fontWeight: 500 }}>
          {cat?.label}!
        </h2>
        <p style={{ color: 'var(--text-soft)', marginTop: 8, fontSize: 15 }}>
          {achievement.loggedByName} noticed {child?.name} {cat?.description.toLowerCase()}
        </p>
        
        {achievement.photoUrl && (
          <div style={{ 
            marginTop: 20, borderRadius: 18, overflow: 'hidden',
            border: '2px solid var(--border)',
            background: `url(${achievement.photoUrl}) center/cover`,
            height: 220,
          }}/>
        )}
        
        {achievement.note && (
          <p style={{ 
            marginTop: 16, padding: 14, background: 'var(--surface)', borderRadius: 14,
            fontSize: 14, color: 'var(--text)', fontStyle: 'italic',
          }}>"{achievement.note}"</p>
        )}
        
        <div style={{ 
          marginTop: 24, padding: '12px 20px', 
          background: 'rgba(255,213,132,0.15)', borderRadius: 14,
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 22 }}>⭐</span>
          <span style={{ fontWeight: 700, color: 'var(--star-gold)' }}>
            +{achievement.coinsValue || 1} star{(achievement.coinsValue || 1) > 1 ? 's' : ''}
          </span>
        </div>
        
        <button onClick={onClose} className="btn-primary" style={{ 
          width: '100%', marginTop: 24, fontSize: 17,
        }}>
          Collect ✨
        </button>
      </div>
    </div>
  )
}

function CoinShower({ count }) {
  const coins = Array.from({ length: count * 3 }, (_, i) => ({
    id: i,
    x: 40 + Math.random() * 20,
    delay: Math.random() * 0.3,
    duration: 1 + Math.random() * 0.4,
    rotation: Math.random() * 360,
  }))
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200 }}>
      {coins.map(c => (
        <div key={c.id} style={{ 
          position: 'absolute', top: '40%', left: `${c.x}%`,
          fontSize: 28,
          animation: `coinFall ${c.duration}s ease-in ${c.delay}s forwards`,
          transform: `rotate(${c.rotation}deg)`,
        }}>⭐</div>
      ))}
      <style>{`
        @keyframes coinFall {
          0% { transform: translateY(0) rotate(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(80vh) rotate(720deg); opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
