import { PROUD_PRESETS } from '../../../utils/constants'
import Page from '../../../components/Page'

export default function ProudStep({ next, update, data }) {
  const pick = (label) => {
    update({ proudMoment: label })
    setTimeout(next, 600)
  }

  return (
    <Page>
      <div style={{ paddingTop: 32, paddingBottom: 32 }}>
        <h1 style={{ 
          fontFamily: 'var(--display)', fontSize: 34, fontWeight: 500,
          textAlign: 'center', color: 'var(--moon)',
        }}>
          What are you proud of?
        </h1>
        <p style={{ 
          textAlign: 'center', color: 'var(--text-soft)', fontSize: 16, 
          marginTop: 8, marginBottom: 32,
        }}>
          Pick something brilliant you did today
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {PROUD_PRESETS.map(p => {
            const selected = data.proudMoment === p.label
            return (
              <button key={p.label} onClick={() => pick(p.label)}
                className={`kid-tile ${selected ? 'selected' : ''}`}
                style={{ 
                  minHeight: 130, padding: 16, gap: 8,
                  ...(selected ? { transform: 'scale(1.04)' } : {})
                }}>
                <div style={{ fontSize: 42 }}>{p.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>
                  {p.label}
                </div>
              </button>
            )
          })}
        </div>

        <button onClick={next} className="btn-secondary" style={{ 
          marginTop: 24, width: '100%', opacity: 0.7,
        }}>
          Skip
        </button>
      </div>
    </Page>
  )
}
