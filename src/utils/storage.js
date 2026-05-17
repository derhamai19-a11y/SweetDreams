import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase/config'

export async function uploadPhoto(file, householdId, folder = 'photos') {
  if (!file) return null
  const ts = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
  const path = `households/${householdId}/${folder}/${ts}_${safeName}`
  const fileRef = ref(storage, path)
  await uploadBytes(fileRef, file)
  return await getDownloadURL(fileRef)
}

export function resizeImage(file, maxDim = 1200) {
  return new Promise((resolve) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > height && width > maxDim) {
          height = (height * maxDim) / width
          width = maxDim
        } else if (height > maxDim) {
          width = (width * maxDim) / height
          height = maxDim
        }
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          const resized = new File([blob], file.name, { type: 'image/jpeg' })
          resolve(resized)
        }, 'image/jpeg', 0.85)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}
