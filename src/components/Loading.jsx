export default function Loading({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', gap: 20,
    }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid rgba(255,213,132,0.2)',
        borderTopColor: 'var(--star-gold)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}/>
      <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>{message}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
