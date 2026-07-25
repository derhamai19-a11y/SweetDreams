import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, collection, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useHousehold } from '../../contexts/HouseholdContext'
import { DEVELOPMENT_AREAS_SEED } from '../../utils/developmentSeed'
import { getActiveStage, advanceArea } from '../../utils/development'
import Page from '../../components/Page'

export default function GrowthTracker() {
  const { householdId, developmentAreas } = useHousehold()
  const nav = useNavigate()
  const [expanded, setExpanded] = useState(null) // area id currently showing full queue
  const [editingStage, setEditingStage] = useState(null) // { areaDocId, stageId } | null
  const seededRef = useRef(false)

  // First-ever visit: seed the 9 areas from the spec.
  useEffect(() => {
    if (developmentAreas === null) return // still loading
    if (developmentAreas.length > 0) return // already seeded
    if (seededRef.current) return
    seededRef.current = true

    const seed = async () => {
      try {
        const batch = writeBatch(db)
        DEVELOPMENT_AREAS_SEED.forEach(area => {
          const ref = doc(collection(db, 'developmentAreas'))
          batch.set(ref, { householdId, ...area })
        })
        await batch.commit()
      } catch (e) {
        console.error('Could not seed growth areas', e)
        seededRef.current = false
      }
    }
    seed()
  }, [developmentAreas, householdId])

  const togglePinned = async (area) => {
    await updateDoc(doc(db, 'developmentAreas', area.docId), { pinned: !area.pinned })
  }

  const markComplete = async (area) => {
    const { stages, currentStageIndex } = advanceArea(area)
    await updateDoc(doc(db, 'developmentAreas', area.docId), { stages, currentStageIndex })
  }

  // Escape hatch for queues where a stage was seeded mid-queue with partial
  // progress but isn't the current active one (e.g. already-partly-done skills)
  // — lets a parent bring it forward instead of it being stuck forever.
  const makeActive = async (area, stageId) => {
    const stages = area.stages.map(s => {
      if (s.id === stageId) return { ...s, status: 'active' }
      if (s.status === 'active') return { ...s, status: 'pending' }
      return s
    })
    await updateDoc(doc(db, 'developmentAreas', area.docId), { stages })
  }

  const addStretchStage = async (area, label) => {
    if (!label.trim()) return
    const newStage = {
      id: `stg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      label: label.trim(),
      stars: 0,
      status: 'pending',
      isStretch: true,
      notes: null,
    }
    await updateDoc(doc(db, 'developmentAreas', area.docId), {
      stages: [...area.stages, newStage],
    })
  }

  const saveStageEdit = async (area, stageId, patch) => {
    const stages = area.stages.map(s => s.id === stageId ? { ...s, ...patch } : s)
    await updateDoc(doc(db, 'developmentAreas', area.docId), { stages })
    setEditingStage(null)
  }

  if (developmentAreas === null || developmentAreas.length === 0) {
    return (
      <Page>
        <div style={{ paddingTop: 60, textAlign: 'center', color: 'var(--text-soft)' }}>
          Setting up the growth tracker...
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <div style={{ paddingTop: 24, animation: 'fadeIn 0.5s ease' }}>
        <button onClick={() => nav(-1)} style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 16 }}>← Back</button>

        <h1 className="page-title">🌱 Growth tracker</h1>
        <p className="page-subtitle">
          Private, parent-facing progress notes. Log a moment from "Log an achievement → Growth goal" —
          it counts toward stars here and toward the rewards path, in kid-friendly language.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24, marginBottom: 24 }}>
          {developmentAreas.map(area => {
            const active = getActiveStage(area)
            const isExpanded = expanded === area.docId
            return (
              <div key={area.docId} className="card" style={{ padding: '16px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ fontSize: 30, flexShrink: 0 }}>{area.kidEmoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{area.kidLabel}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{area.name}</div>
                  </div>
                  <button onClick={() => togglePinned(area)} title={area.pinned ? 'Unpin from every night' : 'Pin to every night'}
                    style={{
                      fontSize: 18, flexShrink: 0, padding: 4,
                      opacity: area.pinned ? 1 : 0.3,
                    }}>📌</button>
                </div>

                {active ? (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{active.label}</div>
                    {active.notes && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontStyle: 'italic' }}>{active.notes}</div>
                    )}
                    <div style={{ display: 'flex', gap: 4, marginTop: 8, alignItems: 'center' }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} style={{ fontSize: 18, filter: i < active.stars ? 'none' : 'grayscale(1) opacity(0.25)' }}>⭐</span>
                      ))}
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>{active.stars}/5</span>
                      {active.stars >= 5 && (
                        <button onClick={() => markComplete(area)} className="btn-primary"
                          style={{ marginLeft: 'auto', fontSize: 12, padding: '8px 12px' }}>
                          Mark complete →
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                    ✓ Queue complete — add a stretch stage below to keep going.
                  </div>
                )}

                <button onClick={() => setExpanded(isExpanded ? null : area.docId)}
                  style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 12, fontWeight: 600 }}>
                  {isExpanded ? '▲ Hide full queue' : `▼ View full queue (${area.stages.length})`}
                </button>

                {isExpanded && (
                  <StageQueue
                    area={area}
                    editingStage={editingStage}
                    onEdit={(stageId) => setEditingStage({ areaDocId: area.docId, stageId })}
                    onCancelEdit={() => setEditingStage(null)}
                    onSaveEdit={(stageId, patch) => saveStageEdit(area, stageId, patch)}
                    onAddStretch={(label) => addStretchStage(area, label)}
                    onMakeActive={(stageId) => makeActive(area, stageId)}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Page>
  )
}

function StageQueue({ area, editingStage, onEdit, onCancelEdit, onSaveEdit, onAddStretch, onMakeActive }) {
  const [newStretch, setNewStretch] = useState('')

  return (
    <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {area.stages.map(s => {
          const isEditing = editingStage?.areaDocId === area.docId && editingStage?.stageId === s.id
          return (
            <div key={s.id}>
              {isEditing ? (
                <StageEditForm stage={s} onCancel={onCancelEdit} onSave={(patch) => onSaveEdit(s.id, patch)}/>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>
                    {s.status === 'complete' ? '✓' : s.status === 'active' ? '⭐' : s.isStretch ? '➕' : '·'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13,
                      color: s.status === 'complete' ? 'var(--text-muted)' : 'var(--text)',
                      textDecoration: s.status === 'complete' ? 'line-through' : 'none',
                    }}>
                      {s.label}{s.isStretch && <span style={{ fontSize: 10, color: '#8FD9C4', marginLeft: 6 }}>STRETCH</span>}
                    </div>
                    {s.notes && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>{s.notes}</div>
                    )}
                    {s.status === 'pending' && s.stars > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--star-gold)', marginTop: 2 }}>{s.stars}/5 already</div>
                    )}
                  </div>
                  {s.status === 'pending' && (
                    <button onClick={() => onMakeActive(s.id)}
                      style={{ fontSize: 10, color: '#8FD9C4', flexShrink: 0, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      Make active
                    </button>
                  )}
                  {s.status !== 'complete' && (
                    <button onClick={() => onEdit(s.id)} style={{ fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>✏️</button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input className="field-input" value={newStretch}
          onChange={e => setNewStretch(e.target.value)}
          placeholder="Add a stretch stage..."
          style={{ flex: 1, fontSize: 13, padding: '8px 10px' }}/>
        <button onClick={() => { onAddStretch(newStretch); setNewStretch('') }}
          disabled={!newStretch.trim()}
          className="btn-secondary" style={{ fontSize: 13, padding: '8px 14px' }}>
          + Add
        </button>
      </div>
    </div>
  )
}

function StageEditForm({ stage, onCancel, onSave }) {
  const [label, setLabel] = useState(stage.label)
  const [notes, setNotes] = useState(stage.notes || '')

  return (
    <div style={{ padding: 10, background: 'var(--surface)', borderRadius: 10 }}>
      <input className="field-input" value={label}
        onChange={e => setLabel(e.target.value)}
        style={{ fontSize: 13, padding: '6px 10px', marginBottom: 6 }}/>
      <input className="field-input" value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        style={{ fontSize: 12, padding: '6px 10px', marginBottom: 8 }}/>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => onSave({ label: label.trim() || stage.label, notes: notes.trim() || null })}
          className="btn-primary" style={{ flex: 1, fontSize: 12, padding: '7px 0' }}>Save</button>
        <button onClick={onCancel} className="btn-secondary" style={{ flex: 1, fontSize: 12, padding: '7px 0' }}>Cancel</button>
      </div>
    </div>
  )
}
