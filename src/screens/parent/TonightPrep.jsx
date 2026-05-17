import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc, serverTimestamp, collection, addDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useHousehold } from '../../contexts/HouseholdContext'
import Page from '../../components/Page'
import PhotoUpload from '../../components/PhotoUpload'
import { FRIEND_AVATAR } from '../../utils/constants'

const PERSON_EMOJIS = [
  '👨','👩','🧔','👴','👵','🧑','👦','👧','🧒',
  '🙋‍♂️','🙋‍♀️','🧙‍♂️','🧙‍♀️','🦸','🧚','🤗','🎅','🤶',
  '🧑‍🍳','🧑‍🎨','🧑‍💻','🧑‍🏫','🧑‍🔬','👑',
]

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
  const [showPersonEmoji, setShowPersonEmoji] = useState(false)

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

  const addPerson = async () => {
    if (!newPersonName.trim()) return
    const person = {
      id: `custom_${Date.now()}`,
      name: newPersonName.trim(),
      emoji: newPersonEmoji,
    }
    await updateDoc(doc(db, 'households', householdId), {
      gratefulPeople: arrayUnion(person),
    })
    setGratefulIds(prev => [...prev, person.id])
    setNewPersonName('')
    setNewPersonEmoji('👤')
    setShowAddPerson(false)
    setShowPersonEmoji(false)
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
                      <div style={{
                        width: 50, height: 50, borderRadius: '50%',
                        background: `url(${p.photoUrl}) center/cover`,
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
                      lineHeight: 1,
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
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.08em' }}>
                ADD A PERSON
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                <button onClick={() => setShowPersonEmoji(!showPersonEmoji)}
                  style={{
                    fontSize: 28, width: 48, height: 48, flexShrink: 0,
                    background: 'var(--midnight-soft)', borderRadius: 12,
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  {newPersonEmoji}
                </button>
                <input
                  className="field-input"
                  value={newPersonName}
                  onChange={e => setNewPersonName(e.target.value)}
                  placeholder="Their name (Nanna, Grandpa…)"
                  style={{ flex: 1 }}
                />
              </div>
              {showPersonEmoji && (
                <div style={{
                  marginBottom: 10, padding: 10,
                  background: 'var(--midnight-soft)', borderRadius: 12,
                  display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4,
                }}>
                  {PERSON_EMOJIS.map(e => (
                    <button key={e} onClick={() => { setNewPersonEmoji(e); setShowPersonEmoji(false) }}
                      style={{ fontSize: 24, padding: 6, borderRadius: 8 }}>{e}</button>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={addPerson} disabled={!newPersonName.trim()}
                  className="btn-primary" style={{ flex: 1 }}>
                  Add
                </button>
                <button onClick={() => { setShowAddPerson(false); setNewPersonName(''); setShowPersonEmoji(false) }}
                  className="btn-secondary" style={{ flex: 1 }}>
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
          {busy ? 'Saving...' : "Save tonight's prep"}
        </button>
      </div>
    </Page>
  )
}
