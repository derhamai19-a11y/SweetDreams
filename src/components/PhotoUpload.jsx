import { useState, useRef } from 'react'
import { uploadPhoto, resizeImage } from '../utils/storage'

export default function PhotoUpload({ 
  householdId, 
  folder = 'photos', 
  onUploaded, 
  preview, 
  size = 100,
  label = 'Add photo'
}) {
  const [uploading, setUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState(preview || null)
  const inputRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const resized = await resizeImage(file)
      const reader = new FileReader()
      reader.onload = (ev) => setLocalPreview(ev.target.result)
      reader.readAsDataURL(resized)
      const url = await uploadPhoto(resized, householdId, folder)
      setLocalPreview(url)
      onUploaded?.(url)
    } catch (err) {
      console.error('Upload error:', err)
      alert('Could not upload photo. Try again?')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input 
        ref={inputRef}
        type="file" 
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{
          width: size, height: size,
          borderRadius: '50%',
          background: localPreview ? `url(${localPreview}) center/cover` : 'var(--surface)',
          border: '2px dashed var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-soft)', fontSize: 12, fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.2s',
          overflow: 'hidden', position: 'relative',
        }}
      >
        {uploading ? '...' : (!localPreview && label)}
        {localPreview && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0)',
            transition: 'background 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 11, fontWeight: 700,
            opacity: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; e.currentTarget.style.opacity = 1 }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; e.currentTarget.style.opacity = 0 }}
          >CHANGE</div>
        )}
      </button>
    </div>
  )
}
