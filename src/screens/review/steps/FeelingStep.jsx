import { useState } from 'react'
import { FEELINGS } from '../../../utils/constants'
import Page from '../../../components/Page'

export default function FeelingStep({ next, update, data }) {
  const [selected, setSelected] = useState(data.feeling || null)
  const [note, setNote] = useState('')

  const feeling = FEELINGS.find(f => f.id === selected)

  const handleNext = () => {
    update({ feeling: selected, feelingNote: note.trim() || null })
    next()
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
          marginTop: 40,
        }}>
          {FEELINGS.map(f => {
            const isSelected = selected === f.id
            return (
              <button key={f.id} onClick={() => setSelected(f.id)}
                style={{
                  padding: isSelected ? 16 : 24,
                  borderRadius: 'var(--radius-xl)',
                  background: isSelected
                    ? `linear-gradient(135deg, ${f.color}44, ${f.color}22)`
                    : 'var(--surface)',
                  border: '2px solid ' + (isSelected ? f.color : 'var(--border)'),
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  minHeight: isSelected ? 110 : 160,
                  transition: 'all 0.3s',
                  boxShadow: isSelected ? `0 0 28px ${f.color}55` : 'none',
                  transform: isSelected ? 'scale(1.02)' : selected ? 'scale(0.94)' : 'scale(1)',
                  opacity: selected && !isSelected ? 0.45 : 1,
                }}>
                <div style={{ fontSize: isSelected ? 44 : 64 }}>{f.emoji}</div>
                <div style={{
                  fontFamily: 'var(--display)', fontSize: isSelected ? 17 : 22, fontWeight: 500,
                  color: isSelected ? f.color : 'var(--text)',
                }}>{f.label}</div>
              </button>
            )
          })}
        </div>

        {/* Comment section — slides in after picking */}
        {selected && (
          <div style={{ marginTop: 28, animation: 'fadeIn 0.4s ease' }}>
            <p style={{
              fontSize: 17, color: 'var(--text-soft)', marginBottom: 10,
              textAlign: 'center', fontFamily: 'var(--display)', fontStyle: 'italic',
            }}>
              What made you feel {feeling?.label.toLowerCase()}?
            </p>
            <textarea
              className="field-input"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Tell me more... (optional)"
              rows={3}
              style={{ resize: 'none' }}
            />
            <button onClick={handleNext} className="btn-primary" style={{
              width: '100%', marginTop: 14, fontSize: 18,
            }}>
              Continue ✨
            </button>
          </div>
        )}
      </div>
    </Page>
  )
}
