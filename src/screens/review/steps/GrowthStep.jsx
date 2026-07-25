import { useState } from 'react'
import Page from '../../../components/Page'

export default function GrowthStep({ next, update, data, child }) {
  const [note, setNote] = useState(data.growthNote || '')

  const handleNext = () => {
    update({ growthNote: note.trim() || null })
    next()
  }

  return (
    <Page>
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', paddingTop: 60, paddingBottom: 40, padding: '60px 24px 40px',
      }}>
        <div style={{ fontSize: 56 }}>🌱</div>
        <h1 style={{
          fontFamily: 'var(--display)', fontSize: 32, fontWeight: 500,
          textAlign: 'center', color: 'var(--moon)', marginTop: 16,
        }}>
          Something to grow
        </h1>
        <p style={{
          textAlign: 'center', color: 'var(--text-soft)', fontSize: 15,
          marginTop: 8, marginBottom: 28, maxWidth: 340,
        }}>
          Talk it through with {child?.name || 'them'} — a gentle word of encouragement for tomorrow, not a telling off. Totally optional.
        </p>

        <textarea
          className="field-input"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={`e.g. "Let's practice sharing toys with..."`}
          rows={4}
          style={{ width: '100%', maxWidth: 420, resize: 'none' }}
        />

        <button onClick={handleNext} className="btn-primary" style={{
          width: '100%', maxWidth: 420, marginTop: 16, fontSize: 18,
        }}>
          Continue ✨
        </button>
      </div>
    </Page>
  )
}
