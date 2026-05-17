import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useHousehold } from '../../contexts/HouseholdContext'
import { AVATAR_MAP } from '../../utils/constants'
import Page from '../../components/Page'
import MoonLogo from '../../components/MoonLogo'

export default function ParentHome() {
  const { adultProfile, signOut } = useAuth()
  const { household, child, achievements, tonightPrep } = useHousehold()
  const nav = useNavigate()
  
  const avatar = AVATAR_MAP[child?.avatar]
  const uncollected = achievements.length
  const prepReady = tonightPrep && (
    (tonightPrep.gratefulOptions?.length > 0) ||
    (tonightPrep.memoryPhotoOptions?.length > 0) ||
    !!tonightPrep.tomorrowsGoal
  )

  return (
    <Page>
      <div style={{ paddingTop: 24, animation: 'fadeIn 0.5s ease' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <MoonLogo size={36} glow={false}/>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Sweet Dreams</div>
              <div style={{ fontSize: 15, color: 'var(--text-soft)' }}>Hi {adultProfile?.name} 👋</div>
            </div>
          </div>
          <Link to="/family" style={{ 
            width: 40, height: 40, borderRadius: '50%', 
            background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border)', fontSize: 18,
          }}>⚙</Link>
        </div>

        {/* Child summary card */}
        <div className="card" style={{ 
          display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16,
          background: 'linear-gradient(135deg, rgba(177,156,217,0.15), rgba(240,168,184,0.15))',
          borderColor: 'rgba(177,156,217,0.3)',
        }}>
          <div style={{ 
            fontSize: 48, width: 70, height: 70, 
            background: 'var(--surface)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{avatar?.emoji}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: 28, fontWeight: 500, marginBottom: 2 }}>{child?.name}</h2>
            <div style={{ fontSize: 14, color: 'var(--text-soft)' }}>
              {household?.currentCoins || 0} coin{household?.currentCoins === 1 ? '' : 's'} on the path
            </div>
          </div>
        </div>

        {/* Primary action */}
        <button onClick={() => nav('/log')} className="btn-primary" style={{ 
          width: '100%', padding: '20px', fontSize: 18, marginBottom: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 24 }}>✨</span>
          Log an achievement
        </button>

        {uncollected > 0 && (
          <div style={{
            padding: '12px 16px', borderRadius: 12, marginBottom: 14,
            background: 'rgba(255,213,132,0.12)', border: '1px solid rgba(255,213,132,0.3)',
            fontSize: 14, color: 'var(--star-gold)', textAlign: 'center', fontWeight: 600,
          }}>
            🎁 {uncollected} achievement{uncollected === 1 ? '' : 's'} waiting to collect tonight
          </div>
        )}

        {/* Secondary actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 24 }}>
          <ActionTile to="/tonight" emoji="🌙" title="Tonight's prep" 
            subtitle={prepReady ? 'Ready ✓' : 'Not started'}
            highlight={prepReady}/>
          <ActionTile to="/review" emoji="✨" title="Bedtime review" 
            subtitle="Start with your child"/>
          <ActionTile to="/rewards" emoji="🎁" title="Rewards path" 
            subtitle="Manage rewards"/>
          <ActionTile to="/trophies" emoji="🏆" title="Trophy shelf" 
            subtitle="Past achievements"/>
          <ActionTile to="/memories" emoji="📷" title="Memory book" 
            subtitle="Past days"/>
          <ActionTile to="/family" emoji="👨‍👩‍👧" title="Family" 
            subtitle="People & settings"/>
        </div>

        <button onClick={signOut} style={{ 
          display: 'block', margin: '40px auto 24px', 
          color: 'var(--text-muted)', fontSize: 13, textDecoration: 'underline'
        }}>Sign out</button>
      </div>
    </Page>
  )
}

function ActionTile({ to, emoji, title, subtitle, highlight }) {
  return (
    <Link to={to} className="card" style={{ 
      textDecoration: 'none', color: 'var(--text)',
      display: 'flex', flexDirection: 'column', gap: 4,
      padding: 16, transition: 'all 0.2s',
      ...(highlight ? { borderColor: 'var(--star-gold)', background: 'rgba(255,213,132,0.08)' } : {})
    }}>
      <div style={{ fontSize: 26, marginBottom: 4 }}>{emoji}</div>
      <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>{subtitle}</div>
    </Link>
  )
}
