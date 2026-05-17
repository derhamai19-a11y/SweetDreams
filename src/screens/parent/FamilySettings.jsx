import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../contexts/AuthContext'
import { useHousehold } from '../../contexts/HouseholdContext'
import { AVATARS } from '../../utils/constants'
import Page from '../../components/Page'

export default function FamilySettings() {
  const { adultProfile, signOut } = useAuth()
  const { householdId, household, adults, child } = useHousehold()
  const nav = useNavigate()
  const [copied, setCopied] = useState(false)

  const isAdmin = adultProfile?.role === 'admin'

  const copyCode = () => {
    navigator.clipboard.writeText(householdId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleAdmin = async (adult) => {
    if (!isAdmin) return
    if (adult.id === adultProfile.id) {
      const others = adults.filter(a => a.role === 'admin' && a.id !== adult.id)
      if (others.length === 0) {
        alert('There must be at least one admin')
        return
      }
    }
    await updateDoc(doc(db, 'adults', adult.id), {
      role: adult.role === 'admin' ? 'standard' : 'admin'
    })
  }

  const removeAdult = async (adult) => {
    if (!isAdmin || adult.id === adultProfile.id) return
    if (!confirm(`Remove ${adult.name} from the family?`)) return
    await deleteDoc(doc(db, 'adults', adult.id))
  }

  return (
    <Page>
      <div style={{ paddingTop: 24, animation: 'fadeIn 0.5s ease' }}>
        <button onClick={() => nav(-1)} style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 16 }}>← Back</button>
        
        <h1 className="page-title">Family</h1>
        <p className="page-subtitle">{household?.name}</p>

        {/* Child */}
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontFamily: 'var(--display)', fontSize: 22, marginBottom: 12 }}>Little one</h3>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 40 }}>{AVATARS.find(a => a.id === child?.avatar)?.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 500 }}>{child?.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>
                {AVATARS.find(a => a.id === child?.avatar)?.label}
              </div>
            </div>
          </div>
        </div>

        {/* Adults */}
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontFamily: 'var(--display)', fontSize: 22, marginBottom: 12 }}>Grown-ups</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {adults.map(a => (
              <div key={a.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {a.photoUrl ? (
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: `url(${a.photoUrl}) center/cover` }}/>
                ) : (
                  <div style={{ 
                    width: 48, height: 48, borderRadius: '50%', 
                    background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                  }}>👤</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>
                    {a.role === 'admin' ? '👑 Admin' : 'Standard'}
                    {a.id === adultProfile.id && ' · You'}
                  </div>
                </div>
                {isAdmin && a.id !== adultProfile.id && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => toggleAdmin(a)} style={{ 
                      fontSize: 12, padding: '6px 10px', borderRadius: 8, 
                      background: 'var(--surface)', color: 'var(--text)',
                      border: '1px solid var(--border)', fontWeight: 600,
                    }}>{a.role === 'admin' ? 'Demote' : 'Make admin'}</button>
                    <button onClick={() => removeAdult(a)} style={{ 
                      fontSize: 12, padding: '6px 10px', borderRadius: 8, 
                      background: 'transparent', color: 'var(--rose)', fontWeight: 600,
                    }}>Remove</button>
                  </div>
                )}
                {isAdmin && a.id === adultProfile.id && (
                  <button onClick={() => toggleAdmin(a)} style={{ 
                    fontSize: 12, padding: '6px 10px', borderRadius: 8, 
                    background: 'var(--surface)', color: 'var(--text)',
                    border: '1px solid var(--border)', fontWeight: 600,
                  }}>{a.role === 'admin' ? 'Demote self' : 'Make admin'}</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Invite */}
        {isAdmin && (
          <div style={{ marginTop: 28 }}>
            <h3 style={{ fontFamily: 'var(--display)', fontSize: 22, marginBottom: 12 }}>Invite a grown-up</h3>
            <div className="card">
              <p style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 10 }}>
                Share this code so another adult can join. They'll create their own account first, then enter this code.
              </p>
              <div style={{ 
                background: 'var(--midnight-deep)', padding: 14, borderRadius: 10,
                fontFamily: 'monospace', fontSize: 13, wordBreak: 'break-all',
                color: 'var(--star-gold)', marginBottom: 10,
              }}>{householdId}</div>
              <button onClick={copyCode} className="btn-secondary" style={{ width: '100%' }}>
                {copied ? '✓ Copied' : 'Copy code'}
              </button>
            </div>
          </div>
        )}

        <button onClick={signOut} style={{ 
          display: 'block', margin: '40px auto 24px', 
          color: 'var(--text-muted)', fontSize: 13, textDecoration: 'underline'
        }}>Sign out</button>
      </div>
    </Page>
  )
}
