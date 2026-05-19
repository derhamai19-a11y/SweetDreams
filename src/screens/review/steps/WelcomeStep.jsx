import { AVATAR_MAP } from '../../../utils/constants'
import Page from '../../../components/Page'

export default function WelcomeStep({ next, child }) {
  const avatar = AVATAR_MAP[child?.avatar]
  return (
    <Page>
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        paddingTop: 40, paddingBottom: 40,
      }}>
        {child?.photoUrl ? (
          <div style={{
            width: 150, height: 150, borderRadius: '50%', overflow: 'hidden',
            animation: 'float 4s ease-in-out infinite',
            boxShadow: '0 0 40px rgba(255,213,132,0.5)',
            border: '3px solid rgba(255,213,132,0.4)',
          }}>
            <img src={child.photoUrl} alt={child.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          </div>
        ) : (
          <div style={{
            fontSize: 120, animation: 'float 4s ease-in-out infinite',
            filter: 'drop-shadow(0 0 30px rgba(255,213,132,0.4))',
          }}>{avatar?.emoji}</div>
        )}
        
        <h1 style={{ 
          fontFamily: 'var(--display)', fontSize: 44, fontWeight: 500,
          marginTop: 32, color: 'var(--moon)',
        }}>
          Hello, {child?.name}
        </h1>
        
        <p style={{ 
          fontSize: 19, color: 'var(--text-soft)', marginTop: 16,
          fontStyle: 'italic', maxWidth: 320, lineHeight: 1.5,
        }}>
          Are you ready to look back on your day?
        </p>
        
        <button onClick={next} className="btn-primary" style={{ 
          marginTop: 48, fontSize: 20, padding: '20px 48px',
        }}>
          Yes ✨
        </button>
      </div>
    </Page>
  )
}
