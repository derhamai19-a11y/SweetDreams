import { useHousehold } from '../../../contexts/HouseholdContext'
import { FRIEND_AVATAR } from '../../../utils/constants'
import Page from '../../../components/Page'

export default function GratefulStep({ next, update, data, tonightPrep }) {
  const { adults } = useHousehold()
  
  const options = tonightPrep?.gratefulOptions?.length > 0
    ? tonightPrep.gratefulOptions
    : adults.map(a => a.id) // fallback to all adults if no prep

  const people = options.map(id => {
    if (id === 'friend') return FRIEND_AVATAR
    return adults.find(a => a.id === id)
  }).filter(Boolean)

  const pick = (id) => {
    update({ gratefulFor: id })
    setTimeout(next, 600)
  }

  return (
    <Page>
      <div style={{ paddingTop: 32, paddingBottom: 32 }}>
        <h1 style={{ 
          fontFamily: 'var(--display)', fontSize: 34, fontWeight: 500,
          textAlign: 'center', color: 'var(--moon)',
        }}>
          Who made you smile?
        </h1>
        <p style={{ 
          textAlign: 'center', color: 'var(--text-soft)', fontSize: 16, 
          marginTop: 8, marginBottom: 32,
        }}>
          Pick someone you're thankful for today
        </p>
        
        {people.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-soft)', padding: 40 }}>
            (No one selected for tonight)
          </p>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: people.length <= 2 ? '1fr 1fr' : 'repeat(3, 1fr)', 
            gap: 12 
          }}>
            {people.map(p => {
              const selected = data.gratefulFor === p.id
              return (
                <button key={p.id} onClick={() => pick(p.id)}
                  className={`kid-tile ${selected ? 'selected' : ''}`}
                  style={{ 
                    minHeight: 140, padding: 16,
                    ...(selected ? { transform: 'scale(1.05)' } : {}),
                  }}>
                  {p.photoUrl ? (
                    <div style={{ 
                      width: 72, height: 72, borderRadius: '50%',
                      background: `url(${p.photoUrl}) center/cover`,
                      border: '3px solid ' + (selected ? 'var(--star-gold)' : 'var(--border)'),
                    }}/>
                  ) : (
                    <div style={{ fontSize: 56 }}>{p.emoji || '👤'}</div>
                  )}
                  <div style={{ 
                    fontFamily: 'var(--display)', fontSize: 17, fontWeight: 500,
                    marginTop: 6, textAlign: 'center',
                  }}>{p.name || p.label}</div>
                </button>
              )
            })}
          </div>
        )}

        <button onClick={next} className="btn-secondary" style={{ 
          marginTop: 24, width: '100%', opacity: 0.7,
        }}>
          Skip
        </button>
      </div>
    </Page>
  )
}
