import { useState, useRef } from 'react'
import { FEELINGS, FEELING_REASONS } from '../../../utils/constants'
import Page from '../../../components/Page'

const OTHER_CARD = { id: 'other', emoji: '❓', label: 'Other' }

export default function FeelingStep({ next, update, data }) {
  const [selected, setSelected] = useState(data.feeling || null)
  const [reason, setReason] = useState(null)
  const [note, setNote] = useState('')
  const noteRef = useRef(null)

  const feeling = FEELINGS.find(f => f.id === selected)
  const reasons = [...(FEELING_REASONS[selected] || []), OTHER_CARD]

  const pickFeeling = (id) => {
    setSelected(id)
    setReason(null)
    setNote('')
  }

  const pickReason = (card) => {
    setReason(card)
    if (card.id === 'other') {
      setNote('')
      setTimeout(() => noteRef.current?.focus(), 50)
    } else {
      setNote(card.label)
    }
  }

  const handleNext = () => {
    update({
      feeling: selected,
      feelingReason: reason && reason.id !== 'other' ? reason.label : null,
      feelingNote: note.trim() || null,
    })
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
              <button key={f.id} onClick={() => pickFeeling(f.id)}
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

        {/* Reason cards — slide in after picking a feeling */}
        {selected && (
          <div style={{ marginTop: 28, animation: 'fadeIn 0.4s ease' }}>
            <p style={{
              fontSize: 17, color: 'var(--text-soft)', marginBottom: 14,
              textAlign: 'center', fontFamily: 'var(--display)', fontStyle: 'italic',
            }}>
              What made you feel {feeling?.label.toLowerCase()}?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {reasons.map(r => {
                const isSelected = reason?.id === r.id
                return (
                  <button key={r.id} onClick={() => pickReason(r)}
                    className={`kid-tile ${isSelected ? 'selected' : ''}`}
                    style={{ minHeight: 100, padding: 14, gap: 6 }}>
                    <div style={{ fontSize: 30 }}>{r.emoji}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>
                      {r.label}
                    </div>
                  </button>
                )
              })}
            </div>

            <textarea
              ref={noteRef}
              className="field-input"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add any details... (optional)"
              rows={3}
              style={{ resize: 'none', marginTop: 16 }}
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
