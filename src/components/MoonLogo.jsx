export default function MoonLogo({ size = 80, glow = true }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, animation: 'float 4s ease-in-out infinite' }}>
      {glow && (
        <div style={{
          position: 'absolute', inset: -20,
          background: 'radial-gradient(circle, rgba(255,213,132,0.4) 0%, transparent 70%)',
          borderRadius: '50%',
        }}/>
      )}
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', position: 'relative' }}>
        <defs>
          <radialGradient id="moonGrad" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#FFF8E0"/>
            <stop offset="60%" stopColor="#FFE9B8"/>
            <stop offset="100%" stopColor="#F0C870"/>
          </radialGradient>
        </defs>
        {/* Crescent moon */}
        <circle cx="50" cy="50" r="35" fill="url(#moonGrad)"/>
        <circle cx="62" cy="44" r="32" fill="#0F1729"/>
        {/* Stars around */}
        <text x="15" y="22" fontSize="10" fill="#FFD584">✦</text>
        <text x="78" y="78" fontSize="8" fill="#FFB97A">✦</text>
        <text x="10" y="85" fontSize="6" fill="#FFF4DA">✦</text>
      </svg>
    </div>
  )
}
