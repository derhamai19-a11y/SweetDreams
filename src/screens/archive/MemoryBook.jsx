import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useHousehold } from '../../contexts/HouseholdContext'
import { FEELINGS } from '../../utils/constants'
import Page from '../../components/Page'

export default function MemoryBook() {
  const { householdId } = useHousehold()
  const nav = useNavigate()
  const [reviews, setReviews] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!householdId) return
    // No orderBy — avoids needing a composite Firestore index. Sort client-side.
    const q = query(
      collection(db, 'dailyReviews'),
      where('householdId', '==', householdId)
    )
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      docs.sort((a, b) => b.date.localeCompare(a.date))
      setReviews(docs)
      setLoading(false)
    }, (err) => {
      console.error('MemoryBook query error:', err)
      setLoading(false)
    })
    return unsub
  }, [householdId])

  const handleDelete = async (review) => {
    if (!confirm('Delete this memory? This cannot be undone.')) return
    await deleteDoc(doc(db, 'dailyReviews', review.id))
    setSelected(null)
  }

  const fmt = (d) => {
    // Parse YYYY-MM-DD without timezone shift
    const [y, m, day] = d.split('-').map(Number)
    return new Date(y, m - 1, day).toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric'
    })
  }

  return (
    <Page density={40}>
      <div style={{ paddingTop: 24, paddingBottom: 32 }}>
        <button onClick={() => nav(-1)} style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 16 }}>← Back</button>

        <h1 className="page-title">Memory book</h1>
        <p className="page-subtitle">Your days, kept safe</p>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-soft)', marginTop: 40 }}>Loading...</p>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 60, color: 'var(--text-soft)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📷</div>
            <p>No memories yet</p>
            <p style={{ fontSize: 13, marginTop: 8 }}>Complete a bedtime review to start your book</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 24 }}>
            {reviews.map(r => {
              const feeling = FEELINGS.find(f => f.id === r.feeling)
              return (
                <button key={r.id} onClick={() => setSelected(r)}
                  style={{
                    aspectRatio: '4/5', position: 'relative',
                    borderRadius: 16, overflow: 'hidden',
                    border: '1px solid var(--border)',
                    background: r.memoryPhotoUrl
                      ? `url(${r.memoryPhotoUrl}) center/cover`
                      : 'var(--surface)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    cursor: 'pointer',
                  }}>
                  {!r.memoryPhotoUrl && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 48,
                    }}>{feeling?.emoji || '🌙'}</div>
                  )}
                  <div style={{
                    padding: '24px 12px 10px',
                    background: 'linear-gradient(to top, rgba(15,23,41,0.95), transparent)',
                    color: 'white', textAlign: 'left',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{fmt(r.date)}</div>
                    {feeling && <div style={{ fontSize: 18 }}>{feeling.emoji}</div>}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {selected && (
        <MemoryDetail
          review={selected}
          onClose={() => setSelected(null)}
          onDelete={() => handleDelete(selected)}
        />
      )}
    </Page>
  )
}

function MemoryDetail({ review, onClose, onDelete }) {
  const feeling = FEELINGS.find(f => f.id === review.feeling)
  const fmt = (d) => {
    const [y, m, day] = d.split('-').map(Number)
    return new Date(y, m - 1, day).toLocaleDateString(undefined, {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    })
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(15,23,41,0.95)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      animation: 'fadeIn 0.3s ease', overflow: 'auto',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--midnight-soft)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: 24,
        width: '100%', maxWidth: 420, maxHeight: '90vh', overflow: 'auto',
        animation: 'scaleIn 0.4s ease',
      }}>
        <p style={{
          fontFamily: 'var(--display)', fontStyle: 'italic',
          color: 'var(--text-soft)', fontSize: 14,
        }}>{fmt(review.date)}</p>

        {review.memoryPhotoUrl && (
          <div style={{
            marginTop: 16, aspectRatio: '4/5',
            background: `url(${review.memoryPhotoUrl}) center/cover`,
            borderRadius: 16, border: '2px solid var(--border)',
          }}/>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20 }}>
          {feeling && (
            <Row label="Feeling">
              <span style={{ fontSize: 22 }}>{feeling.emoji}</span>
              <span style={{ fontSize: 15, color: feeling.color }}>{feeling.label}</span>
            </Row>
          )}
          {review.proudMoment && <Row label="Proud of">{review.proudMoment}</Row>}
          {review.tomorrowsGoal && <Row label="Goal">{review.tomorrowsGoal}</Row>}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
            Close
          </button>
          <button onClick={onDelete} style={{
            flex: 1, padding: '12px', borderRadius: 12,
            background: 'transparent', color: 'var(--rose)',
            border: '1px solid var(--rose)', fontWeight: 700, fontSize: 14,
          }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div>
      <div style={{
        fontSize: 11, color: 'var(--text-muted)', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4,
      }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, color: 'var(--text)' }}>
        {children}
      </div>
    </div>
  )
}
