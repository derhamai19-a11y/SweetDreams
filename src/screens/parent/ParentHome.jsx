import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../contexts/AuthContext'
import { useHousehold } from '../../contexts/HouseholdContext'
import { AVATAR_MAP, CATEGORIES, CATEGORY_MAP } from '../../utils/constants'
import Page from '../../components/Page'
import MoonLogo from '../../components/MoonLogo'

export default function ParentHome() {
  const { adultProfile, signOut } = useAuth()
  const { household, child, achievements, tonightPrep } = useHousehold()
  const nav = useNavigate()
  const [editing, setEditing] = useState(null)

  const avatar = AVATAR_MAP[child?.avatar]
  const prepReady = tonightPrep && (
    (tonightPrep.gratefulOptions?.length > 0) ||
    (tonightPrep.memoryPhotoOptions?.length > 0) ||
    !!tonightPrep.tomorrowsGoal
  )

  const openEdit = (achievement) => {
    setEditing({
      ...achievement,
      editCategory: achievement.category,
      editNote: achievement.note || '',
      editCoins: achievement.coinsValue || 1,
    })
  }

  const saveEdit = async () => {
    if (!editing) return
    await updateDoc(doc(db, 'achievements', editing.id), {
      category: editing.editCategory,
      note: editing.editNote.trim() || null,
      coinsValue: editing.editCoins,
    })
    setEditing(null)
  }

  const deleteAchievement = async (id) => {
    if (!confirm('Remove this achievement?')) return
    await deleteDoc(doc(db, 'achievements', id))
  }

  return (
    <Page>
      <div style={{ paddingTop: 24, animation: 'fadeIn 0.5s ease' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <MoonLogo size={36} glow={false}/>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Sweet Dreams</div>
              <div style={{ fontSize: 15, color: 'var(--text-soft)' }}>Hi {adultProfile?.name} 👋</div>
            </div>
          </div>
          <Link to="/family" style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border)', fontSize: 18,
          }}>⚙</Link>
        </div>

        {/* Child summary card */}
        <div className="card" style={{
          display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16,
          background: 'linear-gradient(135deg, rgba(177,156,217,0.15), rgba(240,168,184,0.15))',
          borderColor: 'rgba(177,156,217,0.3)',
        }}>
          {child?.photoUrl ? (
            <img src={child.photoUrl} alt={child.name}
              style={{
                width: 70, height: 70, borderRadius: '50%',
                objectFit: 'cover', flexShrink: 0,
              }}/>
          ) : (
            <div style={{
              fontSize: 48, width: 70, height: 70,
              background: 'var(--surface)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>{avatar?.emoji}</div>
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: 28, fontWeight: 500, marginBottom: 2 }}>{child?.name}</h2>
            <div style={{ fontSize: 14, color: 'var(--text-soft)' }}>
              {household?.currentCoins || 0} star{household?.currentCoins === 1 ? '' : 's'} on the path
            </div>
          </div>
        </div>

        {/* Primary action */}
        <button onClick={() => nav('/log')} className="btn-primary" style={{
          width: '100%', padding: '20px', fontSize: 18, marginBottom: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 24 }}>✨</span>
          Log an achievement
        </button>

        {/* Achievement log */}
        {achievements.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Today's achievements · collect at bedtime
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {achievements.map(a => {
                const cat = CATEGORY_MAP[a.category]
                return (
                  <div key={a.id} className="card" style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px',
                    background: `${cat?.color}11`,
                    borderColor: `${cat?.color}44`,
                  }}>
                    {a.photoUrl ? (
                      <img src={a.photoUrl} alt=""
                        style={{
                          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                          objectFit: 'cover',
                        }}/>
                    ) : (
                      <div style={{ fontSize: 28, flexShrink: 0 }}>{a.emoji || cat?.emoji}</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: cat?.color }}>{cat?.label}</div>
                      {a.note && (
                        <div style={{
                          fontSize: 12, color: 'var(--text-soft)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{a.note}</div>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--star-gold)', fontWeight: 700, flexShrink: 0 }}>
                      {'⭐'.repeat(Math.min(a.coinsValue || 1, 3))}{(a.coinsValue || 1) > 3 ? ` ×${a.coinsValue}` : ''}
                    </div>
                    <button onClick={() => openEdit(a)} style={{
                      fontSize: 16, padding: '4px 6px', color: 'var(--text-soft)', flexShrink: 0,
                    }}>✏️</button>
                    <button onClick={() => deleteAchievement(a.id)} style={{
                      fontSize: 16, padding: '4px 6px', color: 'var(--text-soft)', flexShrink: 0,
                    }}>🗑️</button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tonight prep + Bedtime review */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <ActionTile to="/tonight" emoji="🌙" title="Tonight's prep"
            subtitle={prepReady ? 'Ready ✓' : 'Not started'}
            highlight={prepReady}/>
          <ActionTile to="/review" emoji="✨" title="Bedtime review"
            subtitle="Start with your child"/>
        </div>

        {/* Reward path */}
        <RewardPath household={household}/>

        {/* Secondary tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
          <ActionTile to="/trophies" emoji="🏆" title="Trophy shelf"
            subtitle="Past achievements"/>
          <ActionTile to="/memories" emoji="📷" title="Memory book"
            subtitle="Past days"/>
          <ActionTile to="/rewards" emoji="🎁" title="Edit rewards"
            subtitle="Manage path"/>
          <ActionTile to="/family" emoji="👨‍👩‍👧" title="Family"
            subtitle="People & settings"/>
        </div>

        <button onClick={signOut} style={{
          display: 'block', margin: '40px auto 24px',
          color: 'var(--text-muted)', fontSize: 13, textDecoration: 'underline'
        }}>Sign out</button>
      </div>

      {/* Achievement edit modal */}
      {editing && (
        <AchievementEditModal
          editing={editing}
          onChange={(patch) => setEditing(e => ({ ...e, ...patch }))}
          onSave={saveEdit}
          onClose={() => setEditing(null)}
        />
      )}
    </Page>
  )
}

function RewardPath({ household }) {
  const path = household?.rewardsPath || []
  const coins = household?.currentCoins || 0
  const [expanded, setExpanded] = useState(null)
  if (path.length === 0) return null

  return (
    <div style={{ marginBottom: 10 }}>
      <div className="card" style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 500 }}>Reward path</div>
          <div style={{ fontSize: 13, color: 'var(--star-gold)', fontWeight: 700 }}>
            ⭐ {coins} star{coins === 1 ? '' : 's'}
          </div>
        </div>

        {path.map((r, i) => {
          const prevThreshold = i === 0 ? 0 : path[i - 1].threshold
          const segmentSize = Math.max(1, r.threshold - prevThreshold)
          const coinsInSegment = Math.max(0, Math.min(coins - prevThreshold, segmentSize))
          const starsFilled = coins >= r.threshold ? 10 : Math.floor((coinsInSegment / segmentSize) * 10)
          const unlocked = coins >= r.threshold

          return (
            <div key={r.id}>
              {/* 10-star track for this segment */}
              <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginBottom: 8 }}>
                {Array.from({ length: 10 }).map((_, si) => (
                  <span key={si} style={{
                    fontSize: 15,
                    filter: si < starsFilled ? 'none' : 'grayscale(1) opacity(0.18)',
                    display: 'inline-block',
                  }}>⭐</span>
                ))}
              </div>

              {/* Reward card — tappable */}
              <button onClick={() => setExpanded(r)} style={{
                width: '100%', borderRadius: 14, overflow: 'hidden', display: 'block',
                border: `2px solid ${unlocked ? 'var(--star-gold)' : 'rgba(255,244,218,0.12)'}`,
                background: 'none', cursor: 'pointer', textAlign: 'left',
                boxShadow: unlocked ? '0 0 16px rgba(255,213,132,0.22)' : 'none',
                marginBottom: 14,
              }}>
                <div style={{
                  height: 110, position: 'relative',
                  background: r.photoUrl
                    ? `url(${r.photoUrl}) center/cover`
                    : unlocked
                      ? 'linear-gradient(135deg, rgba(255,213,132,0.25), rgba(255,185,122,0.25))'
                      : 'rgba(255,244,218,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 52,
                  filter: !unlocked ? 'grayscale(0.5) opacity(0.65)' : 'none',
                }}>
                  {!r.photoUrl && r.emoji}
                  {!unlocked && r.photoUrl && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,12,26,0.45)' }}/>
                  )}
                  {unlocked && (
                    <span style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'var(--star-gold)', color: 'var(--midnight)',
                      borderRadius: 20, padding: '2px 9px',
                      fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
                    }}>✓ UNLOCKED</span>
                  )}
                </div>
                <div style={{
                  padding: '9px 13px', background: 'rgba(255,244,218,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: unlocked ? 'var(--star-gold)' : 'var(--text)' }}>
                      {r.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {unlocked ? '🌟 You earned this!' : `${r.threshold - coins} star${r.threshold - coins === 1 ? '' : 's'} to go`}
                    </div>
                  </div>
                  <span style={{ fontSize: 14, opacity: 0.35 }}>↗</span>
                </div>
              </button>
            </div>
          )
        })}
      </div>

      {/* Lightbox */}
      {expanded && (
        <div onClick={() => setExpanded(null)} style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(15,23,41,0.96)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, animation: 'fadeIn 0.2s ease',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 360, animation: 'scaleIn 0.25s ease',
          }}>
            <div style={{
              borderRadius: 20, overflow: 'hidden',
              border: `3px solid ${coins >= expanded.threshold ? 'var(--star-gold)' : 'rgba(255,244,218,0.15)'}`,
              boxShadow: coins >= expanded.threshold ? '0 0 48px rgba(255,213,132,0.4)' : 'none',
            }}>
              <div style={{
                height: 300,
                background: expanded.photoUrl
                  ? `url(${expanded.photoUrl}) center/cover`
                  : coins >= expanded.threshold
                    ? 'linear-gradient(135deg, var(--star-gold), var(--star-warm))'
                    : 'var(--midnight-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 90,
              }}>
                {!expanded.photoUrl && expanded.emoji}
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 500 }}>{expanded.name}</div>
              <div style={{
                fontSize: 15, marginTop: 6,
                color: coins >= expanded.threshold ? 'var(--star-gold)' : 'var(--text-soft)',
              }}>
                {coins >= expanded.threshold
                  ? '🌟 You unlocked this!'
                  : `${expanded.threshold - coins} more star${expanded.threshold - coins === 1 ? '' : 's'} needed`}
              </div>
              <button onClick={() => setExpanded(null)} className="btn-secondary" style={{ width: '100%', marginTop: 16 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AchievementEditModal({ editing, onChange, onSave, onClose }) {
  const [busy, setBusy] = useState(false)

  const handleSave = async () => {
    setBusy(true)
    await onSave()
    setBusy(false)
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(15,23,41,0.92)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0 0 0 0', animation: 'fadeIn 0.2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--midnight-soft)',
        border: '1px solid var(--border)',
        borderRadius: '20px 20px 0 0', padding: 24,
        width: '100%', maxWidth: 480,
        animation: 'slideUp 0.3s ease',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 16, letterSpacing: '0.08em' }}>
          EDIT ACHIEVEMENT
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="field-label">Category</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => onChange({ editCategory: c.id })}
                style={{
                  padding: '10px 4px', borderRadius: 10,
                  background: editing.editCategory === c.id ? `${c.color}33` : 'var(--surface)',
                  border: `1px solid ${editing.editCategory === c.id ? c.color : 'var(--border)'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}>
                <span style={{ fontSize: 20 }}>{c.emoji}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: editing.editCategory === c.id ? c.color : 'var(--text-soft)' }}>
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="field-label">Note</label>
          <textarea className="field-input" value={editing.editNote}
            onChange={e => onChange({ editNote: e.target.value })}
            placeholder="What happened?"
            rows={2} style={{ marginTop: 6, resize: 'none' }}/>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="field-label">Stars</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            {[1, 2, 3, 5].map(n => (
              <button key={n} onClick={() => onChange({ editCoins: n })}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10,
                  background: editing.editCoins === n ? 'var(--star-gold)' : 'var(--surface)',
                  color: editing.editCoins === n ? 'var(--midnight)' : 'var(--text)',
                  fontWeight: 700, fontSize: 15,
                  border: '1px solid ' + (editing.editCoins === n ? 'var(--star-gold)' : 'var(--border)'),
                }}>{n}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSave} disabled={busy || !editing.editCategory}
            className="btn-primary" style={{ flex: 1 }}>
            {busy ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function ActionTile({ to, emoji, title, subtitle, highlight }) {
  return (
    <Link to={to} className="card" style={{
      textDecoration: 'none', color: 'var(--text)',
      display: 'flex', flexDirection: 'column', gap: 4,
      padding: 16, transition: 'all 0.2s',
      ...(highlight ? { borderColor: 'var(--star-gold)', background: 'rgba(255,213,132,0.08)' } : {})
    }}>
      <div style={{ fontSize: 26, marginBottom: 4 }}>{emoji}</div>
      <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>{subtitle}</div>
    </Link>
  )
}
