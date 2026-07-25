import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useHousehold } from '../../contexts/HouseholdContext'
import { CATEGORIES, CATEGORY_MAP } from '../../utils/constants'
import Page from '../../components/Page'

export default function TrophyShelf() {
  const { householdId, child } = useHousehold()
  const nav = useNavigate()
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!householdId) return
    const q = query(
      collection(db, 'achievements'),
      where('householdId', '==', householdId),
      where('collected', '==', true)
    )
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      docs.sort((a, b) => (b.collectedAt?.seconds || 0) - (a.collectedAt?.seconds || 0))
      setItems(docs)
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [householdId])

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter)
  
  const counts = CATEGORIES.reduce((acc, c) => {
    acc[c.id] = items.filter(i => i.category === c.id).length
    return acc
  }, {})

  const fmtDate = (ts) => {
    if (!ts?.seconds) return ''
    return new Date(ts.seconds * 1000).toLocaleDateString(undefined, { 
      month: 'short', day: 'numeric' 
    })
  }

  return (
    <Page density={40}>
      <div style={{ paddingTop: 24, paddingBottom: 32 }}>
        <button onClick={() => nav(-1)} style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 16 }}>← Back</button>
        
        <h1 className="page-title">Trophy shelf</h1>
        <p className="page-subtitle">
          {items.length} thing{items.length === 1 ? '' : 's'} {child?.name} has done
        </p>

        {/* Category filter pills */}
        <div style={{ 
          display: 'flex', gap: 8, marginTop: 24, overflowX: 'auto', 
          paddingBottom: 8, marginLeft: -20, paddingLeft: 20, paddingRight: 20,
          marginRight: -20,
        }}>
          <FilterPill active={filter === 'all'} onClick={() => setFilter('all')} 
            label="All" count={items.length} emoji="🏆"/>
          {CATEGORIES.map(c => (
            counts[c.id] > 0 && (
              <FilterPill key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}
                label={c.label} count={counts[c.id]} emoji={c.emoji} color={c.color}/>
            )
          ))}
        </div>
        
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-soft)', marginTop: 40 }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 60, color: 'var(--text-soft)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
            <p>{items.length === 0 ? 'No trophies yet' : 'Nothing here yet'}</p>
            <p style={{ fontSize: 13, marginTop: 8 }}>
              {items.length === 0 ? 'Log achievements and they\'ll appear here after bedtime' : 'Try another category'}
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: 10, marginTop: 20,
          }}>
            {filtered.map(item => {
              const cat = CATEGORY_MAP[item.category]
              return (
                <button key={item.id} onClick={() => setSelected(item)}
                  style={{
                    background: item.photoUrl 
                      ? `url(${item.photoUrl}) center/cover`
                      : `linear-gradient(135deg, ${cat?.color}33, ${cat?.color}11)`,
                    border: `1px solid ${cat?.color}55`,
                    borderRadius: 16, overflow: 'hidden', position: 'relative',
                    aspectRatio: '1', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column',
                  }}>
                  {!item.photoUrl && (
                    <div style={{ 
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 56,
                    }}>{cat?.emoji}</div>
                  )}
                  <div style={{ 
                    marginTop: 'auto', padding: '24px 10px 8px',
                    background: 'linear-gradient(to top, rgba(15,23,41,0.95), transparent)',
                    color: 'white', textAlign: 'left',
                  }}>
                    <div style={{ fontSize: 18, marginBottom: 2 }}>{cat?.emoji}</div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{cat?.label}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,244,218,0.7)' }}>
                      {fmtDate(item.collectedAt || item.loggedAt)}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
      
      {selected && <TrophyDetail item={selected} child={child} onClose={() => setSelected(null)}/>}
    </Page>
  )
}

function FilterPill({ active, onClick, label, count, emoji, color }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 14px', borderRadius: 999,
      background: active 
        ? (color ? `${color}33` : 'var(--star-gold)') 
        : 'var(--surface)',
      border: `1px solid ${active ? (color || 'var(--star-gold)') : 'var(--border)'}`,
      color: active && !color ? 'var(--midnight)' : 'var(--text)',
      fontSize: 13, fontWeight: 700,
      whiteSpace: 'nowrap', flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <span>{emoji}</span>
      <span>{label}</span>
      <span style={{ opacity: 0.7 }}>·</span>
      <span>{count}</span>
    </button>
  )
}

function TrophyDetail({ item, child, onClose }) {
  const cat = CATEGORY_MAP[item.category]
  const fmtDate = (ts) => {
    if (!ts?.seconds) return ''
    return new Date(ts.seconds * 1000).toLocaleDateString(undefined, { 
      weekday: 'long', month: 'long', day: 'numeric' 
    })
  }
  
  return (
    <div onClick={onClose} style={{ 
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(15,23,41,0.95)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'fadeIn 0.3s ease', overflow: 'auto',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: `linear-gradient(180deg, ${cat?.color}22, var(--midnight-soft))`,
        border: `2px solid ${cat?.color}`,
        borderRadius: 'var(--radius-xl)', padding: 28,
        width: '100%', maxWidth: 400, maxHeight: '90vh', overflow: 'auto',
        animation: 'scaleIn 0.4s ease',
        textAlign: 'center',
        boxShadow: `0 20px 60px ${cat?.color}44`,
      }}>
        <div style={{ fontSize: 64 }}>{cat?.emoji}</div>
        <h2 style={{ 
          fontFamily: 'var(--display)', fontSize: 28, color: cat?.color, 
          fontWeight: 500, marginTop: 8,
        }}>
          {cat?.label}
        </h2>
        <p style={{ color: 'var(--text-soft)', fontSize: 14, marginTop: 4 }}>
          {fmtDate(item.loggedAt)}
        </p>
        
        {item.photoUrl && (
          <div style={{ 
            marginTop: 20, aspectRatio: '4/3',
            background: `url(${item.photoUrl}) center/cover`,
            borderRadius: 16, border: '2px solid var(--border)',
          }}/>
        )}
        
        {item.note && (
          <p style={{ 
            marginTop: 16, padding: 14, 
            background: 'var(--surface)', borderRadius: 14,
            fontSize: 15, color: 'var(--text)', fontStyle: 'italic',
            textAlign: 'left',
          }}>"{item.note}"</p>
        )}
        
        <p style={{ marginTop: 16, fontSize: 14, color: 'var(--text-soft)' }}>
          {item.loggedByName} noticed {child?.name}
        </p>
        
        <button onClick={onClose} className="btn-secondary" style={{ width: '100%', marginTop: 24 }}>
          Close
        </button>
      </div>
    </div>
  )
}
