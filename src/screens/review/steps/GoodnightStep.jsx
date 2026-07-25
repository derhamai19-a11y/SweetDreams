import { AVATAR_MAP } from '../../../utils/constants'
import Page from '../../../components/Page'
import MoonLogo from '../../../components/MoonLogo'

export default function GoodnightStep({ onCompleteReview, submitting, child }) {
  const avatar = AVATAR_MAP[child?.avatar]
  
  return (
    <Page>
      <div style={{ 
        minHeight: '100vh', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24,
        animation: 'fadeIn 0.6s ease',
      }}>
        <MoonLogo size={120}/>
        
        <div style={{ fontSize: 48, marginTop: 24, opacity: 0.8 }}>
          {avatar?.emoji}
        </div>
        
        <h1 style={{ 
          fontFamily: 'var(--display)', fontSize: 44, fontWeight: 500,
          marginTop: 24, color: 'var(--moon)',
          fontStyle: 'italic',
        }}>
          Sweet dreams,
        </h1>
        <h1 style={{ 
          fontFamily: 'var(--display)', fontSize: 44, fontWeight: 500,
          color: 'var(--star-gold)',
          fontStyle: 'italic',
        }}>
          {child?.name}
        </h1>
        
        <p style={{ 
          marginTop: 24, color: 'var(--text-soft)', fontSize: 17,
          maxWidth: 320, lineHeight: 1.5,
        }}>
          Today is safe in your memory book. ✨
        </p>
        
        <button onClick={onCompleteReview} disabled={submitting} className="btn-primary" style={{ 
          marginTop: 56, fontSize: 18, padding: '18px 40px',
        }}>
          {submitting ? 'Saving...' : 'Goodnight 🌙'}
        </button>
      </div>
    </Page>
  )
}
