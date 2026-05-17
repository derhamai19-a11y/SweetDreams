import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, updateDoc, addDoc, collection, serverTimestamp, increment, deleteDoc, writeBatch } from 'firebase/firestore'
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
    proudMoment: null,
    gratefulFor: null,
    memoryPhotoUrl: null,
  })
  const [submitting, setSubmitting] = useState(false)

  const step = STEPS[stepIndex]
  const next = () => setStepIndex(i => Math.min(i + 1, STEPS.length - 1))
  const prev = () => setStepIndex(i => Math.max(i - 1, 0))
  const update = (patch) => setReviewData(d => ({ ...d, ...patch }))

  // When achievements step completes, mark them collected and add coins
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

  // Save the daily review and reset path if final reward hit
  const completeReview = async () => {
    setSubmitting(true)
    try {
      const today = new Date().toISOString().slice(0, 10)
      await addDoc(collection(db, 'dailyReviews'), {
        householdId,
        childId: child.id,
        date: today,
        feeling: reviewData.feeling,
        proudMoment: reviewData.proudMoment,
        gratefulFor: reviewData.gratefulFor,
        memoryPhotoUrl: reviewData.memoryPhotoUrl,
        tomorrowsGoal: tonightPrep?.tomorrowsGoal || null,
        completedAt: serverTimestamp(),
      })

      // Check if path is fully unlocked → reset cycle
      const path = household?.rewardsPath || []
      const coins = household?.currentCoins || 0
      const lastReward = path[path.length - 1]
      if (lastReward && coins >= lastReward.threshold) {
        await updateDoc(doc(db, 'households', householdId), {
          currentCoins: 0,
          pathCycle: increment(1),
        })
      }

      // Clear today's prep so tomorrow is fresh
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
      <ReviewProgress current={stepIndex} total={STEPS.length}/>
      {step === 'welcome'      && <WelcomeStep {...stepProps}/>}
      {step === 'achievements' && <AchievementsStep {...stepProps}/>}
      {step === 'path'         && <PathStep {...stepProps}/>}
      {step === 'feeling'      && <FeelingStep {...stepProps}/>}
      {step === 'proud'        && <ProudStep {...stepProps}/>}
      {step === 'grateful'     && <GratefulStep {...stepProps}/>}
      {step === 'memory'       && <MemoryStep {...stepProps}/>}
      {step === 'goal'         && <GoalStep {...stepProps}/>}
      {step === 'goodnight'    && <GoodnightStep {...stepProps}/>}
    </div>
  )
}

function ReviewProgress({ current, total }) {
  return (
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
  )
}
