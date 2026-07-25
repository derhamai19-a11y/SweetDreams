import StarField from './StarField'

export default function Page({ children, showStars = true, density = 60 }) {
  return (
    <>
      {showStars && <StarField density={density} />}
      <div className="app-container">
        {children}
      </div>
    </>
  )
}
