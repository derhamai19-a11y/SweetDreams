import { useState } from 'react'
import { resolveAchievementDisplay } from '../../../utils/constants'
import Page from '../../../components/Page'

export default function ProudStep({ next, update, data, achievements, developmentAreas }) {
  const [showCustom, setShowCustom] = useState(false)
  const [customText, setCustomText] = useState('')

  const pick = (label) => {
    update({ proudMoment: label })
    setTimeout(next, 600)
  }

  const submitCustom = () => {
    if (!customText.trim()) return
    pick(customText.trim())
  }

  const list = achievements || []

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
          {list.map(a => {
            const disp = resolveAchievementDisplay(a, developmentAreas)
            const label = disp.label + (a.note ? `: ${a.note}` : '')
            const selected = data.proudMoment === label
            return (
              <button key={a.id} onClick={() => pick(label)}
                className={`kid-tile ${selected ? 'selected' : ''}`}
                style={{
                  minHeight: 130, padding: 16, gap: 8,
                  ...(selected ? { transform: 'scale(1.04)' } : {})
                }}>
                {a.photoUrl ? (
                  <img src={a.photoUrl} alt={disp.label}
                    style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover' }}/>
                ) : (
                  <div style={{ fontSize: 42 }}>{disp.emoji}</div>
                )}
                <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>
                  {disp.label}
                </div>
              </button>
            )
          })}

          {/* Freeform option */}
          <button onClick={() => setShowCustom(true)}
            className={`kid-tile ${showCustom ? 'selected' : ''}`}
            style={{ minHeight: 130, padding: 16, gap: 8 }}>
            <div style={{ fontSize: 42 }}>💭</div>
            <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>
              Something else
            </div>
          </button>
        </div>

        {list.length === 0 && !showCustom && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 20, fontSize: 14 }}>
            Nothing logged today — tell me what you're proud of!
          </p>
        )}

        {showCustom && (
          <div style={{ marginTop: 20, animation: 'fadeIn 0.3s ease' }}>
            <textarea
              className="field-input"
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder="What are you proud of today?"
              rows={3}
              style={{ resize: 'none' }}
              autoFocus
            />
            <button onClick={submitCustom} disabled={!customText.trim()}
              className="btn-primary" style={{ width: '100%', marginTop: 12, opacity: customText.trim() ? 1 : 0.5 }}>
              Continue ✨
            </button>
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
