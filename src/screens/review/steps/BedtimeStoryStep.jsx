import { useState, useRef } from 'react'
import { STORY_QUESTIONS } from '../../../utils/constants'
import { uploadPhoto, resizeImage } from '../../../utils/storage'
import Page from '../../../components/Page'

export default function BedtimeStoryStep({ next, update, data, household, householdId, child }) {
  const lastStory = household?.lastBedtimeStory
  const question = STORY_QUESTIONS[(household?.bedtimeStoryQuestionIndex || 0) % STORY_QUESTIONS.length]

  // Skip the recall screen entirely if there's no history yet.
  const [phase, setPhase] = useState(lastStory ? 'recall' : 'pick')

  if (phase === 'recall') {
    return (
      <Page>
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--display)', fontStyle: 'italic',
            color: 'var(--text-soft)', fontSize: 16, marginBottom: 10,
          }}>Last time we read</p>
          <h1 style={{
            fontFamily: 'var(--display)', fontSize: 30, fontWeight: 500,
            color: 'var(--moon)', marginBottom: 20,
          }}>{lastStory.title}</h1>

          {lastStory.photoUrl && (
            <div style={{
              width: '100%', maxWidth: 320, aspectRatio: '4/5',
              background: `url(${lastStory.photoUrl}) center/cover`,
              borderRadius: 20, border: '3px solid var(--border)',
              marginBottom: 24,
            }}/>
          )}

          <div style={{
            padding: '16px 20px', borderRadius: 16,
            background: 'rgba(177,156,217,0.12)', border: '1px solid rgba(177,156,217,0.35)',
            maxWidth: 340,
          }}>
            <p style={{ fontSize: 17, color: 'var(--moon)', fontFamily: 'var(--display)' }}>{question}</p>
          </div>

          <button onClick={() => setPhase('pick')} className="btn-primary" style={{
            marginTop: 32, fontSize: 18, padding: '16px 40px',
          }}>
            Continue ✨
          </button>
        </div>
      </Page>
    )
  }

  return (
    <PickStory
      next={next}
      update={update}
      data={data}
      householdId={householdId}
      history={household?.bookTitleHistory || []}
      child={child}
    />
  )
}

function PickStory({ next, update, data, householdId, history, child }) {
  const [title, setTitle] = useState(data.bookTitle || '')
  const [photoUrl, setPhotoUrl] = useState(data.bookPhotoUrl || null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const matches = title.trim()
    ? history.filter(t =>
        t.toLowerCase().includes(title.trim().toLowerCase()) &&
        t.toLowerCase() !== title.trim().toLowerCase()
      ).slice(0, 5)
    : []

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !householdId) return
    setUploading(true)
    try {
      const resized = await resizeImage(file)
      const url = await uploadPhoto(resized, householdId, 'books')
      setPhotoUrl(url)
    } catch (err) {
      console.error(err)
      alert('Could not upload photo. Try again?')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const finish = (skip) => {
    if (skip) {
      update({ bookTitle: null, bookPhotoUrl: null })
    } else {
      update({ bookTitle: title.trim() || null, bookPhotoUrl: photoUrl || null })
    }
    next()
  }

  return (
    <Page>
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', paddingTop: 60, paddingBottom: 40, padding: '60px 24px 40px',
      }}>
        <div style={{ fontSize: 56 }}>📖</div>
        <h1 style={{
          fontFamily: 'var(--display)', fontSize: 30, fontWeight: 500,
          textAlign: 'center', color: 'var(--moon)', marginTop: 12,
        }}>
          Tonight's story
        </h1>
        <p style={{
          textAlign: 'center', color: 'var(--text-soft)', fontSize: 15,
          marginTop: 6, marginBottom: 24, maxWidth: 320,
        }}>
          What are you reading tonight?
        </p>

        <div style={{ width: '100%', maxWidth: 380, position: 'relative' }}>
          <input
            className="field-input"
            value={title}
            onChange={e => { setTitle(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            placeholder="Book title"
            style={{ width: '100%' }}
          />
          {showSuggestions && matches.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
              background: 'var(--midnight-soft)', border: '1px solid var(--border)',
              borderRadius: 12, overflow: 'hidden', zIndex: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}>
              {matches.map(m => (
                <button key={m}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => { setTitle(m); setShowSuggestions(false) }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '10px 14px', fontSize: 14, color: 'var(--text)',
                    borderBottom: '1px solid var(--border)',
                  }}>
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={handlePhoto}/>
          <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
            width: 160, height: 160, borderRadius: 16,
            background: photoUrl ? `url(${photoUrl}) center/cover` : 'var(--surface)',
            border: photoUrl ? '2px solid var(--star-gold)' : '2px dashed var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 6, color: 'var(--text-soft)',
          }}>
            {!photoUrl && (
              <>
                <span style={{ fontSize: 30 }}>{uploading ? '⏳' : '📷'}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>
                  {uploading ? 'Uploading…' : `Snap ${child?.name || 'them'} with the book`}
                </span>
              </>
            )}
          </button>
          {photoUrl && (
            <button onClick={() => setPhotoUrl(null)} style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              × Remove photo
            </button>
          )}
        </div>

        <button onClick={() => finish(false)} className="btn-primary" style={{
          width: '100%', maxWidth: 380, marginTop: 32, fontSize: 18,
        }}>
          Continue ✨
        </button>
        <button onClick={() => finish(true)} className="btn-secondary" style={{
          width: '100%', maxWidth: 380, marginTop: 10, opacity: 0.7,
        }}>
          No story tonight
        </button>
      </div>
    </Page>
  )
}
