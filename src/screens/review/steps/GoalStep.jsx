import Page from '../../../components/Page'

export default function GoalStep({ next, tonightPrep }) {
  const goal = tonightPrep?.tomorrowsGoal

  if (!goal) {
    return (
      <Page>
        <div style={{ 
          minHeight: '100vh', display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center',
        }}>
          <div style={{ fontSize: 80 }}>🌅</div>
          <h2 style={{ fontFamily: 'var(--display)', fontSize: 28, marginTop: 24 }}>
            No goal set for tomorrow
          </h2>
          <p style={{ color: 'var(--text-soft)', marginTop: 8 }}>That's ok — let's keep going</p>
          <button onClick={next} className="btn-primary" style={{ marginTop: 32 }}>
            Continue
          </button>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <div style={{ 
        minHeight: '100vh', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center',
      }}>
        <div style={{ 
          fontSize: 64, animation: 'float 4s ease-in-out infinite',
        }}>🌅</div>
        
        <p style={{ 
          fontFamily: 'var(--display)', fontStyle: 'italic',
          color: 'var(--text-soft)', marginTop: 16, fontSize: 16,
        }}>Tomorrow we'll try to...</p>
        
        <div style={{ 
          marginTop: 24, padding: '28px 24px',
          background: 'linear-gradient(135deg, rgba(255,213,132,0.18), rgba(255,185,122,0.12))',
          border: '2px solid rgba(255,213,132,0.4)',
          borderRadius: 'var(--radius-xl)',
          maxWidth: 400,
          boxShadow: '0 0 30px rgba(255,213,132,0.2)',
        }}>
          <p style={{ 
            fontFamily: 'var(--display)', fontSize: 30, fontWeight: 500,
            color: 'var(--moon)', lineHeight: 1.3,
          }}>{goal}</p>
        </div>
        
        <p style={{ 
          marginTop: 24, color: 'var(--text-soft)', fontSize: 15, maxWidth: 320,
        }}>
          You're going to do great. ⭐
        </p>
        
        <button onClick={next} className="btn-primary" style={{ 
          marginTop: 40, fontSize: 18, padding: '18px 40px',
        }}>
          I'll try my best
        </button>
      </div>
    </Page>
  )
}
