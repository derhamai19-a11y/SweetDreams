import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc, serverTimestamp, collection, addDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useHousehold } from '../../contexts/HouseholdContext'
import { uploadPhoto, resizeImage } from '../../utils/storage'
import Page from '../../components/Page'
import { FRIEND_AVATAR } from '../../utils/constants'

const SKIN_TONES = [
  { mod: '',       color: '#FFCC22' },
  { mod: '\u{1F3FB}', color: '#FDDBB4' },
  { mod: '\u{1F3FC}', color: '#E0BB95' },
  { mod: '\u{1F3FD}', color: '#BF8B5E' },
  { mod: '\u{1F3FE}', color: '#9B6340' },
  { mod: '\u{1F3FF}', color: '#5C3317' },
]

function applySkinTone(emoji, mod) {
  if (!emoji || emoji === '👤') return emoji
  const stripped = emoji.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '')
  return stripped + mod
}

export default function TonightPrep() {
  const { householdId, household, adults, tonightPrep } = useHousehold()
  const nav = useNavigate()

  const [gratefulIds, setGratefulIds] = useState([])
  const [memoryPhotos, setMemoryPhotos] = useState([])
  const [goal, setGoal] = useState('')
  const [busy, setBusy] = useState(false)

  // Add person form state
  const [showAddPerson, setShowAddPerson] = useState(false)
  const [newPersonName, setNewPersonName] = useState('')
  const [newPersonEmoji, setNewPersonEmoji] = useState('👤')
  const [newPersonPhoto, setNewPersonPhoto] = useState(null)
  const [uploadingPersonPhoto, setUploadingPersonPhoto] = useState(false)
  const personPhotoRef = useRef(null)

  useEffect(() => {
    if (tonightPrep) {
      setGratefulIds(tonightPrep.gratefulOptions || [])
      setMemoryPhotos(tonightPrep.memoryPhotoOptions || [])
      setGoal(tonightPrep.tomorrowsGoal || '')
    }
  }, [tonightPrep])

  const today = new Date().toISOString().slice(0, 10)
  const customPeople = household?.gratefulPeople || []

  const togglePerson = (id) => {
    setGratefulIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handlePersonPhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPersonPhoto(true)
    try {
      const resized = await resizeImage(file)
      const url = await uploadPhoto(resized, householdId, 'grateful-people')
      setNewPersonPhoto(url)
      setNewPersonEmoji('👤') // clear emoji when photo set
    } catch (err) {
      console.error(err)
      const code = err?.code || ''
      if (code.includes('unauthorized') || code.includes('permission')) {
        alert('Upload failed: Firebase Storage permission denied. Update your Storage Rules to allow authenticated writes.')
      } else {
        alert('Could not upload photo. Try again?')
      }
    } finally {
      setUploadingPersonPhoto(false)
      e.target.value = ''
    }
  }

  const addPerson = async () => {
    if (!newPersonName.trim()) return
    const person = {
      id: `custom_${Date.now()}`,
      name: newPersonName.trim(),
      emoji: newPersonPhoto ? null : newPersonEmoji,
      photoUrl: newPersonPhoto || null,
    }
    await updateDoc(doc(db, 'households', householdId), {
      gratefulPeople: arrayUnion(person),
    })
    setGratefulIds(prev => [...prev, person.id])
    setNewPersonName('')
    setNewPersonEmoji('👤')
    setNewPersonPhoto(null)
    setShowAddPerson(false)
  }

  const removePerson = async (person) => {
    await updateDoc(doc(db, 'households', householdId), {
      gratefulPeople: arrayRemove(person),
    })
    setGratefulIds(prev => prev.filter(id => id !== person.id))
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

  const allPeople = [...adults, ...customPeople, FRIEND_AVATAR]

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
            {allPeople.map(p => {
              const selected = gratefulIds.includes(p.id)
              const isCustom = customPeople.some(c => c.id === p.id)
              return (
                <div key={p.id} style={{ position: 'relative' }}>
                  <button onClick={() => togglePerson(p.id)}
                    className={`kid-tile ${selected ? 'selected' : ''}`}
                    style={{ minHeight: 100, padding: 12, width: '100%' }}>
                    {p.photoUrl ? (
                      <img src={p.photoUrl} alt={p.name || p.label}
                        style={{
                          width: 50, height: 50, borderRadius: '50%',
                          objectFit: 'cover',
                        }}/>
                    ) : (
                      <div style={{ fontSize: 36 }}>{p.emoji || '👤'}</div>
                    )}
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{p.name || p.label}</div>
                  </button>
                  {isCustom && (
                    <button onClick={() => removePerson(p)} style={{
                      position: 'absolute', top: -6, right: -6,
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'var(--midnight-deep)', border: '1px solid var(--border)',
                      color: 'var(--text-muted)', fontSize: 14, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>×</button>
                  )}
                </div>
              )
            })}

            {/* Add person button */}
            {!showAddPerson && (
              <button onClick={() => setShowAddPerson(true)}
                className="kid-tile"
                style={{ minHeight: 100, padding: 12, borderStyle: 'dashed', opacity: 0.7 }}>
                <div style={{ fontSize: 28 }}>+</div>
                <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>Add person</div>
              </button>
            )}
          </div>

          {/* Add person inline form */}
          {showAddPerson && (
            <div style={{
              marginTop: 12, padding: 14,
              background: 'var(--surface)', borderRadius: 14,
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, letterSpacing: '0.08em' }}>
                ADD A PERSON
              </div>

              {/* Photo or emoji selector row */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                {/* Photo upload */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <input type="file" accept="image/*" ref={personPhotoRef}
                    style={{ display: 'none' }} onChange={handlePersonPhoto}/>
                  <button onClick={() => personPhotoRef.current?.click()}
                    disabled={uploadingPersonPhoto}
                    style={{
                      width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--midnight-soft)',
                      backgroundImage: newPersonPhoto ? `url(${newPersonPhoto})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      border: newPersonPhoto ? '2px solid var(--star-gold)' : '2px dashed var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22,
                    }}>
                    {uploadingPersonPhoto ? '...' : (!newPersonPhoto && '📷')}
                  </button>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>PHOTO</span>
                </div>

                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>or</div>

                {/* Emoji selector */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <input
                    type="text"
                    value={newPersonEmoji === '👤' ? '' : newPersonEmoji}
                    onChange={e => {
                      const chars = [...e.target.value]
                      const last = chars[chars.length - 1] || '👤'
                      setNewPersonEmoji(last)
                      if (last !== '👤') setNewPersonPhoto(null)
                    }}
                    placeholder="👤"
                    style={{
                      width: 56, height: 56, fontSize: 30, textAlign: 'center', flexShrink: 0,
                      background: 'var(--midnight-soft)', borderRadius: '50%', color: 'var(--text)',
                      border: (!newPersonPhoto && newPersonEmoji !== '👤') ? '2px solid var(--star-gold)' : '2px dashed var(--border)',
                    }}
                  />
                  {newPersonEmoji && newPersonEmoji !== '👤' && (
                    <div style={{ display: 'flex', gap: 3 }}>
                      {SKIN_TONES.map(({ mod, color }) => (
                        <button key={color} onClick={() => setNewPersonEmoji(applySkinTone(newPersonEmoji, mod))}
                          title={mod || 'Default'}
                          style={{
                            width: 14, height: 14, borderRadius: '50%',
                            background: color, border: '1px solid rgba(255,255,255,0.2)',
                            flexShrink: 0,
                          }}/>
                      ))}
                    </div>
                  )}
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>EMOJI</span>
                </div>

                <input
                  className="field-input"
                  value={newPersonName}
                  onChange={e => setNewPersonName(e.target.value)}
                  placeholder="Their name"
                  style={{ flex: 1 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={addPerson} disabled={!newPersonName.trim()}
                  className="btn-primary" style={{ flex: 1 }}>
                  Add
                </button>
                <button onClick={() => {
                  setShowAddPerson(false)
                  setNewPersonName('')
                  setNewPersonPhoto(null)
                }} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
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
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                {/* Reuse PhotoUpload but we need to add memory photos differently */}
                <MemoryPhotoUpload householdId={householdId} onUploaded={addMemory}/>
              </div>
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
          {busy ? 'Saving...' : "Save tonight's prep"}
        </button>
      </div>
    </Page>
  )
}

// Inline memory photo upload (square, not circle)
function MemoryPhotoUpload({ householdId, onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const ref = useRef(null)

  const handle = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !householdId) return
    setUploading(true)
    try {
      const resized = await resizeImage(file)
      const url = await uploadPhoto(resized, householdId, 'memories')
      onUploaded(url)
    } catch (err) {
      console.error(err)
      const code = err?.code || ''
      if (code === 'storage/unauthorized' || code === 'storage/unauthenticated' || code.includes('permission')) {
        alert(
          'Upload failed: Firebase Storage permission denied.\n\n' +
          'Fix: go to Firebase Console → Storage → Rules and set:\n\n' +
          'allow read, write: if request.auth != null;'
        )
      } else if (code.includes('network') || err?.message?.includes('network')) {
        alert('Upload failed: network error. Check your connection and try again.')
      } else {
        alert(`Upload failed [${code || 'unknown'}]: ${err?.message || 'Try again?'}`)
      }
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <>
      <input type="file" accept="image/*" ref={ref} style={{ display: 'none' }} onChange={handle}/>
      <button onClick={() => ref.current?.click()} disabled={uploading} style={{
        width: 90, height: 90, borderRadius: 14,
        background: 'var(--surface)', border: '2px dashed var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 4, color: 'var(--text-soft)', fontSize: 12, fontWeight: 600,
      }}>
        <span style={{ fontSize: 24 }}>📷</span>
        {uploading ? '...' : '+ Photo'}
      </button>
    </>
  )
}
