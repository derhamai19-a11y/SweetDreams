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
            <div style={{
              width: 70, height: 70, borderRadius: '50%',
              background: `url(${child.photoUrl}) center/cover`,
              backgroundSize: 'cover', flexShrink: 0,
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
              {household?.currentCoins || 0} coin{household?.currentCoins === 1 ? '' : 's'} on the path
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
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                        background: `url(${a.photoUrl}) center/cover`,
                      }}/>
                    ) : (
                      <div style={{ fontSize: 28, flexShrink: 0 }}>{cat?.emoji}</div>
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
  if (path.length === 0) return null

  return (
    <div style={{ marginBottom: 10 }}>
      <div className="card" style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 500 }}>Reward path</div>
          <div style={{ fontSize: 13, color: 'var(--star-gold)', fontWeight: 700 }}>
            ⭐ {coins} coin{coins === 1 ? '' : 's'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {path.map((r) => {
            const unlocked = coins >= r.threshold
            return (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: r.photoUrl
                    ? `url(${r.photoUrl}) center/cover`
                    : unlocked
                      ? 'linear-gradient(135deg, var(--star-gold), var(--star-warm))'
                      : 'var(--surface)',
                  border: unlocked ? '2px solid var(--star-gold)' : '2px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                  filter: !unlocked ? 'grayscale(0.5) opacity(0.6)' : 'none',
                  overflow: 'hidden',
                }}>{!r.photoUrl && r.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 700, fontSize: 14,
                    color: unlocked ? 'var(--star-gold)' : 'var(--text)',
                  }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {unlocked ? '✓ Unlocked!' : `${r.threshold - coins} coin${r.threshold - coins === 1 ? '' : 's'} to go`}
                  </div>
                </div>
                {unlocked && <span style={{ fontSize: 18 }}>🌟</span>}
              </div>
            )
          })}
        </div>
      </div>
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
          <label className="field-label">Coins</label>
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
