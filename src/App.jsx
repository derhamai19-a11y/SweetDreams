import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { HouseholdProvider, useHousehold } from './contexts/HouseholdContext'
import Loading from './components/Loading'
import Page from './components/Page'

import SignIn from './screens/setup/SignIn'
import SignUp from './screens/setup/SignUp'
import HouseholdSetup from './screens/setup/HouseholdSetup'
import ChildSetup from './screens/setup/ChildSetup'
import RewardsSetup from './screens/setup/RewardsSetup'

import ParentHome from './screens/parent/ParentHome'
import LogAchievement from './screens/parent/LogAchievement'
import TonightPrep from './screens/parent/TonightPrep'
import FamilySettings from './screens/parent/FamilySettings'
import RewardsManager from './screens/parent/RewardsManager'

import ReviewFlow from './screens/review/ReviewFlow'

import MemoryBook from './screens/archive/MemoryBook'
import TrophyShelf from './screens/archive/TrophyShelf'

function Protected({ children }) {
  const { user, adultProfile, loading } = useAuth()
  if (loading) return <Loading message="Waking up..."/>
  if (!user) return <Navigate to="/signin" replace />
  if (!adultProfile) return <Navigate to="/setup/household" replace />
  return <HouseholdProvider>{children}</HouseholdProvider>
}

function NeedsChild({ children }) {
  const { child, loading } = useHousehold()
  if (loading) return <Loading message="Loading family..."/>
  if (!child) return <Navigate to="/setup/child" replace />
  return children
}

function AppRoutes() {
  const { error } = useAuth()

  if (error) {
    return (
      <Page showStars={false}>
        <div style={{ marginTop: 80, textAlign: 'center' }}>
          <h1 style={{ fontSize: 34, marginBottom: 16 }}>Configuration error</h1>
          <p style={{ color: 'var(--text-soft)', marginBottom: 24, maxWidth: 560, marginInline: 'auto' }}>
            {error.message}
          </p>
          <p style={{ color: 'var(--text-soft)', fontSize: 15 }}>
            Confirm your Firebase env vars are set in Netlify Build Environment and redeploy.
          </p>
        </div>
      </Page>
    )
  }

  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      <Route path="/setup/household" element={
        <Protected_NoProfile><HouseholdSetup /></Protected_NoProfile>
      } />
      <Route path="/setup/child" element={
        <Protected><ChildSetup /></Protected>
      } />
      <Route path="/setup/rewards" element={
        <Protected><RewardsSetup /></Protected>
      } />

      <Route path="/" element={
        <Protected><NeedsChild><ParentHome /></NeedsChild></Protected>
      } />
      <Route path="/log" element={
        <Protected><NeedsChild><LogAchievement /></NeedsChild></Protected>
      } />
      <Route path="/tonight" element={
        <Protected><NeedsChild><TonightPrep /></NeedsChild></Protected>
      } />
      <Route path="/family" element={
        <Protected><FamilySettings /></Protected>
      } />
      <Route path="/rewards" element={
        <Protected><NeedsChild><RewardsManager /></NeedsChild></Protected>
      } />

      <Route path="/review" element={
        <Protected><NeedsChild><ReviewFlow /></NeedsChild></Protected>
      } />

      <Route path="/memories" element={
        <Protected><NeedsChild><MemoryBook /></NeedsChild></Protected>
      } />
      <Route path="/trophies" element={
        <Protected><NeedsChild><TrophyShelf /></NeedsChild></Protected>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

// Variant that allows signed-in users who haven't set up a household yet
function Protected_NoProfile({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading message="Waking up..."/>
  if (!user) return <Navigate to="/signin" replace />
  return children
}
