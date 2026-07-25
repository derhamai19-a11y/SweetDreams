import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Page from '../../components/Page'
import MoonLogo from '../../components/MoonLogo'

export default function SignIn() {
  const { signIn } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signIn(email, password)
      nav('/')
    } catch (err) {
      setError(err.message.includes('invalid') ? 'Wrong email or password' : 'Could not sign in')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page>
      <div style={{ paddingTop: 60, animation: 'fadeIn 0.6s ease' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
          <MoonLogo size={90}/>
          <h1 style={{ fontSize: 44, marginTop: 24, fontFamily: 'var(--display)', fontWeight: 500 }}>Sweet Dreams</h1>
          <p style={{ color: 'var(--text-soft)', marginTop: 8, fontStyle: 'italic' }}>A bedtime ritual for families</p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="field-label">Email</label>
            <input className="field-input" type="email" value={email} 
              onChange={e => setEmail(e.target.value)} required autoComplete="email"/>
          </div>
          <div>
            <label className="field-label">Password</label>
            <input className="field-input" type="password" value={password} 
              onChange={e => setPassword(e.target.value)} required autoComplete="current-password"/>
          </div>
          
          {error && <div style={{ color: 'var(--rose)', fontSize: 14, textAlign: 'center' }}>{error}</div>}
          
          <button type="submit" className="btn-primary" disabled={busy} style={{ marginTop: 8 }}>
            {busy ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 32, color: 'var(--text-soft)', fontSize: 15 }}>
          New here? <Link to="/signup" style={{ color: 'var(--star-gold)', textDecoration: 'none', fontWeight: 700 }}>Create an account</Link>
        </p>
      </div>
    </Page>
  )
}
