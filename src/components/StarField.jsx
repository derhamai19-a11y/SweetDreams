import { useMemo } from 'react'

export default function StarField({ density = 60 }) {
  const stars = useMemo(() => {
    return Array.from({ length: density }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3,
      opacity: 0.3 + Math.random() * 0.5,
    }))
  }, [density])

  return (
    <div className="stars-bg">
      {stars.map(s => (
        <div
          key={s.id}
          className="star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            opacity: s.opacity,
          }}
        />
      ))}
      {/* A few special golden stars */}
      <div style={{
        position: 'absolute', top: '12%', right: '15%',
        fontSize: 14, color: 'var(--star-gold)', opacity: 0.7,
        animation: 'twinkle 4s ease-in-out infinite',
      }}>✦</div>
      <div style={{
        position: 'absolute', top: '8%', left: '20%',
        fontSize: 10, color: 'var(--star-warm)', opacity: 0.6,
        animation: 'twinkle 3.5s ease-in-out 1s infinite',
      }}>✦</div>
      <div style={{
        position: 'absolute', bottom: '15%', left: '8%',
        fontSize: 12, color: 'var(--moon-soft)', opacity: 0.5,
        animation: 'twinkle 5s ease-in-out 0.5s infinite',
      }}>✦</div>
    </div>
  )
}
