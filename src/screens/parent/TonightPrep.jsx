import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useHousehold } from '../../contexts/HouseholdContext'
import Page from '../../components/Page'
import PhotoUpload from '../../components/PhotoUpload'
import { FRIEND_AVATAR } from '../../utils/constants'

export default function TonightPrep() {
  const { householdId, adults, tonightPrep } = useHousehold()
  const nav = useNavigate()
  
  const [gratefulIds, setGratefulIds] = useState([])
  const [memoryPhotos, setMemoryPhotos] = useState([])
  const [goal, setGoal] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (tonightPrep) {
      setGratefulIds(tonightPrep.gratefulOptions || [])
      setMemoryPhotos(tonightPrep.memoryPhotoOptions || [])
      setGoal(tonightPrep.tomorrowsGoal || '')
    }
  }, [tonightPrep])

  const today = new Date().toISOString().slice(0, 10)

  const togglePerson = (id) => {
    setGratefulIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const addMemory = (url) => {
    if (memoryPhotos.length >= 3) return
    setMemoryPhotos([...memoryPhotos, url])
  }
  
  const removeMemory = (i) => {
    setMemoryPhotos(memoryPhotos.filter((_, idx) => idx !== i))
  }

  const submit = async () => {
    setBusy(true)
    try {
      const data = {
        householdId,
        date: today,
        gratefulOptions: gratefulIds,
        memoryPhotoOptions: memoryPhotos,
        tomorrowsGoal: goal.trim(),
        updatedAt: serverTimestamp(),
      }
      if (tonightPrep) {
        await setDoc(doc(db, 'tonightsPrep', tonightPrep.id), data)
      } else {
        await addDoc(collection(db, 'tonightsPrep'), data)
      }
      nav('/')
    } catch (e) {
      console.error(e)
      alert('Could not save')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page>
      <div style={{ paddingTop: 24, animation: 'fadeIn 0.5s ease' }}>
        <button onClick={() => nav(-1)} style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 16 }}>← Back</button>
        
        <h1 className="page-title">Tonight's prep</h1>
        <p className="page-subtitle">Set things up for the bedtime review</p>
        
        {/* Grateful list */}
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontFamily: 'var(--display)', fontSize: 22, marginBottom: 4 }}>Who could they be grateful for?</h3>
          <p style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 14 }}>
            Tap the people who were part of today
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[...adults, FRIEND_AVATAR].map(p => {
              const selected = gratefulIds.includes(p.id)
              return (
                <button key={p.id} onClick={() => togglePerson(p.id)}
                  className={`kid-tile ${selected ? 'selected' : ''}`}
                  style={{ minHeight: 100, padding: 12 }}>
                  {p.photoUrl ? (
                    <div style={{ 
                      width: 50, height: 50, borderRadius: '50%',
                      background: `url(${p.photoUrl}) center/cover`,
                    }}/>
                  ) : (
                    <div style={{ fontSize: 36 }}>{p.emoji || '👤'}</div>
                  )}
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{p.name || p.label}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Memory photos */}
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontFamily: 'var(--display)', fontSize: 22, marginBottom: 4 }}>Memory photos</h3>
          <p style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 14 }}>
            Add up to 3 — they'll pick one for tonight's memory
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {memoryPhotos.map((url, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <div style={{ 
                  width: 90, height: 90, borderRadius: 14,
                  background: `url(${url}) center/cover`,
                  border: '2px solid var(--border)',
                }}/>
                <button onClick={() => removeMemory(i)} style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'var(--rose)', color: 'white',
                  fontSize: 14, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>×</button>
              </div>
            ))}
            {memoryPhotos.length < 3 && (
              <PhotoUpload householdId={householdId} folder="memories" 
                onUploaded={addMemory} size={90} label={`+ Photo`}/>
            )}
          </div>
        </div>

        {/* Tomorrow's goal */}
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontFamily: 'var(--display)', fontSize: 22, marginBottom: 4 }}>Tomorrow's goal</h3>
          <p style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 14 }}>
            Something simple they can aim for
          </p>
          <input className="field-input" value={goal} 
            onChange={e => setGoal(e.target.value)} 
            placeholder="No accidents · Try new food · Be kind to the dog"/>
        </div>

        <button onClick={submit} disabled={busy} className="btn-primary" style={{ width: '100%', marginTop: 32, marginBottom: 24 }}>
          {busy ? 'Saving...' : 'Save tonight\'s prep'}
        </button>
      </div>
    </Page>
  )
}
