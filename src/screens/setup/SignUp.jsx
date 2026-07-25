import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Page from '../../components/Page'
import MoonLogo from '../../components/MoonLogo'

export default function SignUp() {
  const { signUp } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setBusy(true)
    try {
      await signUp(email, password)
      nav('/setup/household')
    } catch (err) {
      if (err.message.includes('already')) setError('Email already in use — try signing in')
      else setError('Could not create account')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page>
      <div style={{ paddingTop: 60, animation: 'fadeIn 0.6s ease' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
          <MoonLogo size={80}/>
          <h1 style={{ fontSize: 36, marginTop: 24, fontFamily: 'var(--display)', fontWeight: 500 }}>Welcome</h1>
          <p style={{ color: 'var(--text-soft)', marginTop: 8, textAlign: 'center', fontSize: 15 }}>Let's set up your family</p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="field-label">Your email</label>
            <input className="field-input" type="email" value={email} 
              onChange={e => setEmail(e.target.value)} required autoComplete="email"/>
          </div>
          <div>
            <label className="field-label">Choose a password</label>
            <input className="field-input" type="password" value={password} 
              onChange={e => setPassword(e.target.value)} required autoComplete="new-password" minLength={6}/>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>At least 6 characters</p>
          </div>
          
          {error && <div style={{ color: 'var(--rose)', fontSize: 14, textAlign: 'center' }}>{error}</div>}
          
          <button type="submit" className="btn-primary" disabled={busy} style={{ marginTop: 8 }}>
            {busy ? 'Creating...' : 'Continue'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 32, color: 'var(--text-soft)', fontSize: 15 }}>
          Already have an account? <Link to="/signin" style={{ color: 'var(--star-gold)', textDecoration: 'none', fontWeight: 700 }}>Sign in</Link>
        </p>
      </div>
    </Page>
  )
}
