import { useState } from 'react'
import Page from '../../../components/Page'

export default function MemoryStep({ next, update, data, tonightPrep }) {
  const [picked, setPicked] = useState(null)
  const photos = tonightPrep?.memoryPhotoOptions || []
  
  const pick = (url) => {
    setPicked(url)
    update({ memoryPhotoUrl: url })
    setTimeout(next, 1400)
  }

  if (photos.length === 0) {
    return (
      <Page>
        <div style={{ 
          minHeight: '100vh', display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center',
        }}>
          <div style={{ fontSize: 80 }}>📷</div>
          <h2 style={{ fontFamily: 'var(--display)', fontSize: 28, marginTop: 24 }}>
            No memory photo tonight
          </h2>
          <p style={{ color: 'var(--text-soft)', marginTop: 8 }}>That's ok — let's keep going</p>
          <button onClick={next} className="btn-primary" style={{ marginTop: 32 }}>
            Continue
          </button>
        </div>
      </Page>
    )
  }

  // If a photo is picked, show it big
  if (picked) {
    return (
      <Page>
        <div style={{ 
          minHeight: '100vh', display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', padding: 24,
          animation: 'scaleIn 0.5s ease',
        }}>
          <p style={{ 
            fontFamily: 'var(--display)', fontStyle: 'italic', 
            color: 'var(--text-soft)', marginBottom: 16, fontSize: 17,
          }}>Today's memory</p>
          <div style={{ 
            width: '100%', maxWidth: 400, aspectRatio: '4/5',
            background: `url(${picked}) center/cover`,
            borderRadius: 20, border: '3px solid var(--star-gold)',
            boxShadow: '0 0 40px rgba(255,213,132,0.4)',
          }}/>
          <p style={{ marginTop: 20, color: 'var(--text-soft)', fontSize: 15 }}>
            ✨ Saved forever ✨
          </p>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <div style={{ paddingTop: 32, paddingBottom: 32 }}>
        <h1 style={{ 
          fontFamily: 'var(--display)', fontSize: 32, fontWeight: 500,
          textAlign: 'center', color: 'var(--moon)',
        }}>
          {photos.length === 1 ? "Today's memory" : "Pick today's memory"}
        </h1>
        <p style={{ 
          textAlign: 'center', color: 'var(--text-soft)', fontSize: 16, 
          marginTop: 8, marginBottom: 32,
        }}>
          {photos.length === 1 ? 'Tap to keep this moment' : 'Which one will we keep?'}
        </p>
        
        <div style={{ 
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          {photos.map((url, i) => (
            <button key={i} onClick={() => pick(url)}
              style={{ 
                width: '100%', aspectRatio: '4/3',
                background: `url(${url}) center/cover`,
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--border)',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          ))}
        </div>
      </div>
    </Page>
  )
}
