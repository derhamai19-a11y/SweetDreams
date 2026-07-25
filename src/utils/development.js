// Helpers for the Growth tracker's queue mechanic: one active stage per area,
// manual star logging, manual complete-and-advance, nightly rotation.

export function getActiveStage(area) {
  if (!area) return null
  return area.stages.find(s => s.status === 'active') || null
}

export function hasActiveStage(area) {
  return !!getActiveStage(area)
}

// Bump a stage's stars (capped at 5), returning a new stages array.
export function incrementStageStars(stages, stageId) {
  return stages.map(s => s.id === stageId ? { ...s, stars: Math.min(5, s.stars + 1) } : s)
}

// Mark the active stage complete and promote the next pending stage to active.
// Returns { stages, currentStageIndex } — currentStageIndex is -1 once the
// queue (including stretch stages) is fully exhausted.
export function advanceArea(area) {
  const activeIndex = area.stages.findIndex(s => s.status === 'active')
  if (activeIndex === -1) return { stages: area.stages, currentStageIndex: area.currentStageIndex }

  const nextIndex = activeIndex + 1
  const stages = area.stages.map((s, i) => {
    if (i === activeIndex) return { ...s, status: 'complete', stars: 5 }
    if (i === nextIndex) return { ...s, status: 'active' }
    return s
  })
  return { stages, currentStageIndex: nextIndex < area.stages.length ? nextIndex : -1 }
}

// Which areas to focus on tonight: pinned areas always included, remaining
// slots (up to 3 total) rotate through the non-pinned areas that still have
// an active stage, advancing by `rotationIndex` each time a review completes.
export function getTonightsAreas(areas, rotationIndex = 0, slotCount = 3) {
  const ordered = [...(areas || [])].sort((a, b) => a.order - b.order)
  const pinned = ordered.filter(a => a.pinned && hasActiveStage(a))
  const rotating = ordered.filter(a => !a.pinned && hasActiveStage(a))

  const remaining = Math.max(0, slotCount - pinned.length)
  const selected = []
  for (let i = 0; i < remaining && i < rotating.length; i++) {
    selected.push(rotating[(rotationIndex + i) % rotating.length])
  }
  return [...pinned, ...selected]
}
