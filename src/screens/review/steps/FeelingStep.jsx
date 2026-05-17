import { FEELINGS } from '../../../utils/constants'
import Page from '../../../components/Page'

export default function FeelingStep({ next, update, data }) {
  const pick = (feeling) => {
    update({ feeling })
    setTimeout(next, 600)
  }

  return (
    <Page>
      <div style={{ 
        minHeight: '100vh', display: 'flex', flexDirection: 'column', 
        paddingTop: 60, paddingBottom: 40,
      }}>
        <h1 style={{ 
          fontFamily: 'var(--display)', fontSize: 36, fontWeight: 500,
          textAlign: 'center', color: 'var(--moon)',
        }}>
          How did today feel?
        </h1>
        <p style={{ 
          textAlign: 'center', color: 'var(--text-soft)', fontSize: 16, 
          marginTop: 8,
        }}>
          Tap how you felt the most today
        </p>
        
        <div style={{ 
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, 
          marginTop: 48, flex: 1, alignContent: 'center',
        }}>
          {FEELINGS.map(f => {
            const selected = data.feeling === f.id
            return (
              <button key={f.id} onClick={() => pick(f.id)}
                style={{ 
                  padding: 24, borderRadius: 'var(--radius-xl)',
                  background: selected 
                    ? `linear-gradient(135deg, ${f.color}44, ${f.color}22)` 
                    : 'var(--surface)',
                  border: '2px solid ' + (selected ? f.color : 'var(--border)'),
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                  minHeight: 160,
                  transition: 'all 0.3s',
                  boxShadow: selected ? `0 0 30px ${f.color}66` : 'none',
                  transform: selected ? 'scale(1.05)' : 'scale(1)',
                }}>
                <div style={{ fontSize: 64 }}>{f.emoji}</div>
                <div style={{ 
                  fontFamily: 'var(--display)', fontSize: 22, fontWeight: 500,
                  color: selected ? f.color : 'var(--text)',
                }}>{f.label}</div>
              </button>
            )
          })}
        </div>
      </div>
    </Page>
  )
}
