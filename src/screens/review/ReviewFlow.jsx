import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, doc, updateDoc, setDoc, serverTimestamp, increment, deleteDoc, writeBatch } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useHousehold } from '../../contexts/HouseholdContext'

import WelcomeStep from './steps/WelcomeStep'
import AchievementsStep from './steps/AchievementsStep'
import PathStep from './steps/PathStep'
import FeelingStep from './steps/FeelingStep'
import ProudStep from './steps/ProudStep'
import GratefulStep from './steps/GratefulStep'
import MemoryStep from './steps/MemoryStep'
import GoalStep from './steps/GoalStep'
import GoodnightStep from './steps/GoodnightStep'

const STEPS = [
  'welcome',
  'achievements',
  'path',
  'feeling',
  'proud',
  'grateful',
  'memory',
  'goal',
  'goodnight',
]

export default function ReviewFlow() {
  const { householdId, household, child, achievements, tonightPrep } = useHousehold()
  const nav = useNavigate()

  const [stepIndex, setStepIndex] = useState(0)
  const [reviewData, setReviewData] = useState({
    feeling: null,
    feelingNote: null,
    proudMoment: null,
    gratefulFor: null,
    memoryPhotoUrl: null,
  })
  const [submitting, setSubmitting] = useState(false)
  const [confirmExit, setConfirmExit] = useState(false)

  const step = STEPS[stepIndex]
  const next = () => setStepIndex(i => Math.min(i + 1, STEPS.length - 1))
  const prev = () => setStepIndex(i => Math.max(i - 1, 0))
  const update = (patch) => setReviewData(d => ({ ...d, ...patch }))

  const completeAchievements = async () => {
    if (achievements.length === 0) {
      next()
      return
    }
    try {
      const totalCoins = achievements.reduce((sum, a) => sum + (a.coinsValue || 1), 0)
      const batch = writeBatch(db)
      achievements.forEach(a => {
        batch.update(doc(db, 'achievements', a.id), {
          collected: true,
          collectedAt: serverTimestamp(),
        })
      })
      batch.update(doc(db, 'households', householdId), {
        currentCoins: increment(totalCoins),
      })
      await batch.commit()
      next()
    } catch (e) {
      console.error(e)
      alert('Something went wrong')
    }
  }

  const completeReview = async () => {
    setSubmitting(true)
    try {
      const today = new Date().toISOString().slice(0, 10)
      // Deterministic ID: overwrite if review already done today
      await setDoc(doc(db, 'dailyReviews', `${householdId}_${today}`), {
        householdId,
        childId: child.id,
        date: today,
        feeling: reviewData.feeling,
        feelingNote: reviewData.feelingNote,
        proudMoment: reviewData.proudMoment,
        gratefulFor: reviewData.gratefulFor,
        memoryPhotoUrl: reviewData.memoryPhotoUrl,
        tomorrowsGoal: tonightPrep?.tomorrowsGoal || null,
        completedAt: serverTimestamp(),
      })

      const path = household?.rewardsPath || []
      const coins = household?.currentCoins || 0
      const lastReward = path[path.length - 1]
      if (lastReward && coins >= lastReward.threshold) {
        const cycleNumber = (household?.pathCycle || 0) + 1
        const earnBatch = writeBatch(db)
        earnBatch.update(doc(db, 'households', householdId), {
          currentCoins: coins - lastReward.threshold,
          pathCycle: increment(1),
        })
        path.forEach(r => {
          const earnRef = doc(collection(db, 'rewardEarned'))
          earnBatch.set(earnRef, {
            householdId,
            childId: child.id,
            name: r.name,
            photoUrl: r.photoUrl || null,
            threshold: r.threshold,
            pathCycle: cycleNumber,
            earnedAt: serverTimestamp(),
            redeemed: false,
            redeemedAt: null,
          })
        })
        await earnBatch.commit()
      }

      if (tonightPrep?.id) {
        await deleteDoc(doc(db, 'tonightsPrep', tonightPrep.id))
      }

      nav('/')
    } catch (e) {
      console.error(e)
      alert('Could not save review')
    } finally {
      setSubmitting(false)
    }
  }

  const stepProps = {
    next, prev, update, data: reviewData,
    child, household, achievements, tonightPrep,
    onCompleteAchievements: completeAchievements,
    onCompleteReview: completeReview,
    submitting,
  }

  return (
    <div key={step} style={{ animation: 'fadeIn 0.5s ease' }}>
      <ReviewProgress
        current={stepIndex}
        total={STEPS.length}
        onClose={() => setConfirmExit(true)}
        onSave={completeReview}
        submitting={submitting}
      />
      {step === 'welcome'      && <WelcomeStep {...stepProps}/>}
      {step === 'achievements' && <AchievementsStep {...stepProps}/>}
      {step === 'path'         && <PathStep {...stepProps}/>}
      {step === 'feeling'      && <FeelingStep {...stepProps}/>}
      {step === 'proud'        && <ProudStep {...stepProps}/>}
      {step === 'grateful'     && <GratefulStep {...stepProps}/>}
      {step === 'memory'       && <MemoryStep {...stepProps}/>}
      {step === 'goal'         && <GoalStep {...stepProps}/>}
      {step === 'goodnight'    && <GoodnightStep {...stepProps}/>}

      {/* Exit confirmation */}
      {confirmExit && (
        <div onClick={() => setConfirmExit(false)} style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(7,12,26,0.95)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, animation: 'fadeIn 0.2s ease',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--midnight-soft)', border: '1px solid var(--border)',
            borderRadius: 20, padding: 28, width: '100%', maxWidth: 320,
            textAlign: 'center', animation: 'scaleIn 0.2s ease',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🌙</div>
            <h3 style={{ fontFamily: 'var(--display)', fontSize: 22, marginBottom: 8 }}>
              Leave the review?
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-soft)', marginBottom: 24, lineHeight: 1.5 }}>
              Progress won't be saved. Come back any time!
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => nav('/')} style={{
                flex: 1, padding: 13, borderRadius: 12,
                background: 'var(--surface)', border: '1px solid var(--border)',
                fontWeight: 700, fontSize: 15, color: 'var(--text)',
              }}>Leave</button>
              <button onClick={() => setConfirmExit(false)} className="btn-primary"
                style={{ flex: 1, padding: 13, fontSize: 15 }}>
                Keep going
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ReviewProgress({ current, total, onClose, onSave, submitting }) {
  return (
    <>
      {/* Progress bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 4,
        background: 'rgba(255,244,218,0.08)', zIndex: 50,
      }}>
        <div style={{
          width: `${((current + 1) / total) * 100}%`,
          height: '100%',
          background: 'linear-gradient(90deg, var(--star-gold), var(--star-warm))',
          transition: 'width 0.5s ease',
          boxShadow: '0 0 8px rgba(255,213,132,0.6)',
        }}/>
      </div>

      {/* Close button — top left */}
      <button onClick={onClose} style={{
        position: 'fixed', top: 10, left: 16, zIndex: 51,
        fontSize: 13, color: 'var(--text-muted)', fontWeight: 600,
        padding: '6px 12px', borderRadius: 20,
        background: 'rgba(15,23,41,0.75)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,244,218,0.12)',
      }}>✕ Close</button>

      {/* Save button — top right */}
      <button onClick={onSave} disabled={submitting} style={{
        position: 'fixed', top: 10, right: 16, zIndex: 51,
        fontSize: 13, color: 'var(--star-gold)', fontWeight: 700,
        padding: '6px 12px', borderRadius: 20,
        background: 'rgba(15,23,41,0.75)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,213,132,0.25)',
        opacity: submitting ? 0.5 : 1,
      }}>{submitting ? '...' : 'Save & exit'}</button>
    </>
  )
}
