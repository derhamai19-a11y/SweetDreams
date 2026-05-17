import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../contexts/AuthContext'
import { DEFAULT_REWARDS } from '../../utils/constants'
import Page from '../../components/Page'
import PhotoUpload from '../../components/PhotoUpload'

export default function HouseholdSetup() {
  const { user, signOut, refreshProfile } = useAuth()
  const nav = useNavigate()
  const [mode, setMode] = useState(null) // 'create' | 'join'
  const [familyName, setFamilyName] = useState('')
  const [yourName, setYourName] = useState('')
  const [yourPhoto, setYourPhoto] = useState(null)
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const createHousehold = async () => {
    if (!familyName.trim() || !yourName.trim()) {
      setError('Please fill in both names')
      return
    }
    setBusy(true)
    setError('')
    try {
      const householdId = user.uid // use creator's uid as household id
      
      // Create household doc
      await setDoc(doc(db, 'households', householdId), {
        name: familyName.trim(),
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        rewardsPath: DEFAULT_REWARDS,
        currentCoins: 0,
        pathCycle: 1,
      })
      
      // Create adult profile (admin)
      await setDoc(doc(db, 'adults', user.uid), {
        householdId,
        email: user.email,
        name: yourName.trim(),
        photoUrl: yourPhoto || null,
        role: 'admin',
        joinedAt: serverTimestamp(),
      })
      
      await refreshProfile()
      nav('/setup/child')
    } catch (err) {
      console.error(err)
      setError('Could not create household. Try again?')
    } finally {
      setBusy(false)
    }
  }

  const joinHousehold = async () => {
    if (!inviteCode.trim() || !yourName.trim()) {
      setError('Please enter your name and invite code')
      return
    }
    setBusy(true)
    setError('')
    try {
      const code = inviteCode.trim()

      // Create adult doc first — Firestore rules require household membership to
      // read a household doc, so we must exist in adults before we can verify the code.
      await setDoc(doc(db, 'adults', user.uid), {
        householdId: code,
        email: user.email,
        name: yourName.trim(),
        photoUrl: yourPhoto || null,
        role: 'standard',
        joinedAt: serverTimestamp(),
      })

      // Now verify the household exists (we're now a "member" so the read is allowed)
      const hhSnap = await getDoc(doc(db, 'households', code))
      if (!hhSnap.exists()) {
        setError('Invite code not found — double-check and try again')
        setBusy(false)
        return
      }

      await refreshProfile()
      nav('/')
    } catch (err) {
      console.error(err)
      setError(`Could not join: ${err?.message || 'Check the code and try again'}`)
    } finally {
      setBusy(false)
    }
  }

  if (!mode) {
    return (
      <Page>
        <div style={{ paddingTop: 60, animation: 'fadeIn 0.5s ease' }}>
          <h1 className="page-title">Hello there</h1>
          <p className="page-subtitle">Are you starting a new family on Sweet Dreams, or joining an existing one?</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 40 }}>
            <button onClick={() => setMode('create')} className="kid-tile" style={{ alignItems: 'flex-start' }}>
              <div style={{ fontSize: 32 }}>🏡</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 500 }}>Start a new family</div>
              <div style={{ fontSize: 14, color: 'var(--text-soft)' }}>You'll be the admin</div>
            </button>
            <button onClick={() => setMode('join')} className="kid-tile" style={{ alignItems: 'flex-start' }}>
              <div style={{ fontSize: 32 }}>🔗</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 500 }}>Join an existing family</div>
              <div style={{ fontSize: 14, color: 'var(--text-soft)' }}>You'll need an invite code</div>
            </button>
          </div>
          
          <button onClick={signOut} style={{ 
            display: 'block', margin: '40px auto 0',
            color: 'var(--text-muted)', fontSize: 13, textDecoration: 'underline'
          }}>Sign out</button>
        </div>
      </Page>
    )
  }

  if (mode === 'create') {
    return (
      <Page>
        <div style={{ paddingTop: 40, animation: 'fadeIn 0.5s ease' }}>
          <button onClick={() => setMode(null)} style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 24 }}>← Back</button>
          <h1 className="page-title">Your family</h1>
          <p className="page-subtitle">Just a few details to get started</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 32 }}>
            <div>
              <label className="field-label">Family name</label>
              <input className="field-input" value={familyName} 
                onChange={e => setFamilyName(e.target.value)} placeholder="The Smith Family"/>
            </div>
            
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
              <PhotoUpload householdId={user.uid} folder="profiles" onUploaded={setYourPhoto} size={90} label="Photo"/>
              <div style={{ flex: 1 }}>
                <label className="field-label">Your name</label>
                <input className="field-input" value={yourName} 
                  onChange={e => setYourName(e.target.value)} placeholder="Mummy, Daddy, etc."/>
              </div>
            </div>
            
            {error && <div style={{ color: 'var(--rose)', fontSize: 14, textAlign: 'center' }}>{error}</div>}
            
            <button onClick={createHousehold} disabled={busy} className="btn-primary" style={{ marginTop: 8 }}>
              {busy ? 'Creating...' : 'Create family'}
            </button>
          </div>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <div style={{ paddingTop: 40, animation: 'fadeIn 0.5s ease' }}>
        <button onClick={() => setMode(null)} style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 24 }}>← Back</button>
        <h1 className="page-title">Join family</h1>
        <p className="page-subtitle">Ask the family admin for the invite code</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 32 }}>
          <div>
            <label className="field-label">Invite code</label>
            <input className="field-input" value={inviteCode} 
              onChange={e => setInviteCode(e.target.value)} placeholder="Paste code here"/>
          </div>
          
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
            <PhotoUpload householdId={inviteCode || 'temp'} folder="profiles" onUploaded={setYourPhoto} size={90} label="Photo"/>
            <div style={{ flex: 1 }}>
              <label className="field-label">Your name</label>
              <input className="field-input" value={yourName} 
                onChange={e => setYourName(e.target.value)} placeholder="Nanna, Grandpa, etc."/>
            </div>
          </div>
          
          {error && <div style={{ color: 'var(--rose)', fontSize: 14, textAlign: 'center' }}>{error}</div>}
          
          <button onClick={joinHousehold} disabled={busy} className="btn-primary" style={{ marginTop: 8 }}>
            {busy ? 'Joining...' : 'Join family'}
          </button>
        </div>
      </div>
    </Page>
  )
}
