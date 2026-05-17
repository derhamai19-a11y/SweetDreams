import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../contexts/AuthContext'
import { useHousehold } from '../../contexts/HouseholdContext'
import { AVATARS } from '../../utils/constants'
import Page from '../../components/Page'
import PhotoUpload from '../../components/PhotoUpload'

const FAMILY_EMOJIS = [
  '👨','👩','🧔','👴','👵','🧑','👦','👧','🧒',
  '🙋‍♂️','🙋‍♀️','🤰','🧙‍♂️','🧙‍♀️','🦸‍♂️','🦸‍♀️',
  '🎅','🤶','🧑‍🍳','🧑‍🎨','🧑‍💻','🧑‍🏫','👑','🤗',
]

export default function FamilySettings() {
  const { adultProfile, signOut, refreshProfile } = useAuth()
  const { householdId, household, adults, child } = useHousehold()
  const nav = useNavigate()
  const [copied, setCopied] = useState(false)

  // Edit child state
  const [editingChild, setEditingChild] = useState(false)
  const [childPhoto, setChildPhoto] = useState(null)
  const [childAvatar, setChildAvatar] = useState(null)
  const [childName, setChildName] = useState('')
  const [savingChild, setSavingChild] = useState(false)

  // Edit-my-profile state
  const [editingProfile, setEditingProfile] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhoto, setEditPhoto] = useState(null)
  const [editEmoji, setEditEmoji] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  const isAdmin = adultProfile?.role === 'admin'

  const startEditChild = () => {
    setChildName(child?.name || '')
    setChildPhoto(child?.photoUrl || null)
    setChildAvatar(child?.avatar || null)
    setEditingChild(true)
  }

  const saveChild = async () => {
    if (!childName.trim() || !child?.id) return
    setSavingChild(true)
    try {
      await updateDoc(doc(db, 'children', child.id), {
        name: childName.trim(),
        photoUrl: childPhoto || null,
        avatar: childAvatar || null,
      })
      setEditingChild(false)
    } catch (e) {
      console.error(e)
      alert('Could not save. Try again?')
    } finally {
      setSavingChild(false)
    }
  }

  const startEdit = () => {
    setEditName(adultProfile?.name || '')
    setEditPhoto(adultProfile?.photoUrl || null)
    setEditEmoji(adultProfile?.emoji || null)
    setShowEmojiPicker(false)
    setEditingProfile(true)
  }

  const saveProfile = async () => {
    if (!editName.trim()) return
    setSavingProfile(true)
    try {
      await updateDoc(doc(db, 'adults', adultProfile.id), {
        name: editName.trim(),
        photoUrl: editPhoto || null,
        emoji: editEmoji || null,
      })
      await refreshProfile()
      setEditingProfile(false)
    } catch (e) {
      console.error(e)
      alert('Could not save. Try again?')
    } finally {
      setSavingProfile(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(householdId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleAdmin = async (adult) => {
    if (!isAdmin) return
    if (adult.id === adultProfile.id) {
      const others = adults.filter(a => a.role === 'admin' && a.id !== adult.id)
      if (others.length === 0) {
        alert('There must be at least one admin')
        return
      }
    }
    await updateDoc(doc(db, 'adults', adult.id), {
      role: adult.role === 'admin' ? 'standard' : 'admin'
    })
  }

  const removeAdult = async (adult) => {
    if (!isAdmin || adult.id === adultProfile.id) return
    if (!confirm(`Remove ${adult.name} from the family?`)) return
    await deleteDoc(doc(db, 'adults', adult.id))
  }

  return (
    <Page>
      <div style={{ paddingTop: 24, animation: 'fadeIn 0.5s ease' }}>
        <button onClick={() => nav(-1)} style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 16 }}>← Back</button>

        <h1 className="page-title">Family</h1>
        <p className="page-subtitle">{household?.name}</p>

        {/* Child */}
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontFamily: 'var(--display)', fontSize: 22, marginBottom: 12 }}>Little one</h3>
          <div>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {child?.photoUrl ? (
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                  background: `url(${child.photoUrl}) center/cover`,
                }}/>
              ) : (
                <div style={{ fontSize: 40 }}>{AVATARS.find(a => a.id === child?.avatar)?.emoji}</div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 500 }}>{child?.name}</div>
                {!child?.photoUrl && child?.avatar && (
                  <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>
                    {AVATARS.find(a => a.id === child?.avatar)?.label}
                  </div>
                )}
              </div>
              {!editingChild && (
                <button onClick={startEditChild} style={{
                  fontSize: 12, padding: '6px 10px', borderRadius: 8,
                  background: 'var(--surface)', color: 'var(--text)',
                  border: '1px solid var(--border)', fontWeight: 600,
                }}>Edit</button>
              )}
            </div>

            {editingChild && (
              <div className="card" style={{ marginTop: 6, borderColor: 'rgba(177,156,217,0.5)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14, letterSpacing: '0.08em' }}>
                  EDIT LITTLE ONE
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="field-label">Name</label>
                  <input className="field-input" value={childName}
                    onChange={e => setChildName(e.target.value)}
                    style={{ marginTop: 6 }}/>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="field-label">Photo</label>
                  <div style={{ marginTop: 8 }}>
                    <PhotoUpload
                      householdId={householdId}
                      folder="children"
                      onUploaded={(url) => setChildPhoto(url)}
                      preview={childPhoto}
                      size={90}
                      label="Add photo"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="field-label">Or pick an animal friend</label>
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8
                  }}>
                    {AVATARS.map(a => (
                      <button key={a.id}
                        onClick={() => setChildAvatar(a.id)}
                        className={`kid-tile ${childAvatar === a.id ? 'selected' : ''}`}
                        style={{ minHeight: 72, padding: 8 }}>
                        <div style={{ fontSize: 28 }}>{a.emoji}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-soft)' }}>{a.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={saveChild} disabled={savingChild || !childName.trim()}
                    className="btn-primary" style={{ flex: 1 }}>
                    {savingChild ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditingChild(false)}
                    className="btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Adults */}
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontFamily: 'var(--display)', fontSize: 22, marginBottom: 12 }}>Grown-ups</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {adults.map(a => (
              <div key={a.id}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Photo > emoji > default */}
                  {a.photoUrl ? (
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                      background: `url(${a.photoUrl}) center/cover`,
                    }}/>
                  ) : (
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: a.emoji ? 26 : 22,
                    }}>{a.emoji || '👤'}</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>
                      {a.role === 'admin' ? '👑 Admin' : 'Standard'}
                      {a.id === adultProfile.id && ' · You'}
                    </div>
                  </div>

                  {/* Current user buttons */}
                  {a.id === adultProfile.id && !editingProfile && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={startEdit} style={{
                        fontSize: 12, padding: '6px 10px', borderRadius: 8,
                        background: 'var(--surface)', color: 'var(--text)',
                        border: '1px solid var(--border)', fontWeight: 600,
                      }}>Edit</button>
                      {isAdmin && (
                        <button onClick={() => toggleAdmin(a)} style={{
                          fontSize: 12, padding: '6px 10px', borderRadius: 8,
                          background: 'var(--surface)', color: 'var(--text)',
                          border: '1px solid var(--border)', fontWeight: 600,
                        }}>{a.role === 'admin' ? 'Demote' : 'Make admin'}</button>
                      )}
                    </div>
                  )}

                  {/* Other adult buttons (admin only) */}
                  {isAdmin && a.id !== adultProfile.id && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => toggleAdmin(a)} style={{
                        fontSize: 12, padding: '6px 10px', borderRadius: 8,
                        background: 'var(--surface)', color: 'var(--text)',
                        border: '1px solid var(--border)', fontWeight: 600,
                      }}>{a.role === 'admin' ? 'Demote' : 'Make admin'}</button>
                      <button onClick={() => removeAdult(a)} style={{
                        fontSize: 12, padding: '6px 10px', borderRadius: 8,
                        background: 'transparent', color: 'var(--rose)', fontWeight: 600,
                      }}>Remove</button>
                    </div>
                  )}
                </div>

                {/* Inline edit form for current user */}
                {a.id === adultProfile.id && editingProfile && (
                  <div className="card" style={{ marginTop: 6, borderColor: 'rgba(177,156,217,0.5)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14, letterSpacing: '0.08em' }}>
                      EDIT PROFILE
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label className="field-label">Your name</label>
                      <input className="field-input" value={editName}
                        onChange={e => setEditName(e.target.value)}
                        style={{ marginTop: 6 }}/>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label className="field-label">Photo</label>
                      <div style={{ marginTop: 8 }}>
                        <PhotoUpload
                          householdId={householdId}
                          folder="profiles"
                          onUploaded={(url) => { setEditPhoto(url); setEditEmoji(null) }}
                          preview={editPhoto}
                          size={80}
                          label="Add photo"
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label className="field-label">Or choose an emoji</label>
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        style={{
                          marginTop: 8, fontSize: 28, width: 56, height: 56,
                          background: 'var(--surface)', borderRadius: 12,
                          border: editEmoji ? '2px solid var(--star-gold)' : '1px solid var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                        {editEmoji || '😊'}
                      </button>
                      {showEmojiPicker && (
                        <div style={{
                          marginTop: 8, padding: 10,
                          background: 'var(--midnight-soft)', borderRadius: 12,
                          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4,
                        }}>
                          {FAMILY_EMOJIS.map(e => (
                            <button key={e} onClick={() => {
                              setEditEmoji(e); setEditPhoto(null); setShowEmojiPicker(false)
                            }} style={{ fontSize: 24, padding: 6, borderRadius: 8 }}>{e}</button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={saveProfile} disabled={savingProfile || !editName.trim()}
                        className="btn-primary" style={{ flex: 1 }}>
                        {savingProfile ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={() => setEditingProfile(false)}
                        className="btn-secondary" style={{ flex: 1 }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Invite */}
        {isAdmin && (
          <div style={{ marginTop: 28 }}>
            <h3 style={{ fontFamily: 'var(--display)', fontSize: 22, marginBottom: 12 }}>Invite a grown-up</h3>
            <div className="card">
              <p style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 10 }}>
                Share this code so another adult can join. They'll create their own account first, then enter this code.
              </p>
              <div style={{
                background: 'var(--midnight-deep)', padding: 14, borderRadius: 10,
                fontFamily: 'monospace', fontSize: 13, wordBreak: 'break-all',
                color: 'var(--star-gold)', marginBottom: 10,
              }}>{householdId}</div>
              <button onClick={copyCode} className="btn-secondary" style={{ width: '100%' }}>
                {copied ? '✓ Copied' : 'Copy code'}
              </button>
            </div>
          </div>
        )}

        <button onClick={signOut} style={{
          display: 'block', margin: '40px auto 24px',
          color: 'var(--text-muted)', fontSize: 13, textDecoration: 'underline'
        }}>Sign out</button>
      </div>
    </Page>
  )
}
