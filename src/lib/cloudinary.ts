import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(
  file: Buffer | string,
  folder: string = 'slooze'
): Promise<string | null> {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return null
  }
  try {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) reject(error)
          else resolve(result as { secure_url: string })
        }
      )
      if (typeof file === 'string') {
        cloudinary.uploader.upload(file, { folder }, (error, result) => {
          if (error) reject(error)
          else resolve(result as { secure_url: string })
        })
      } else {
        uploadStream.end(file)
      }
    })
    return result.secure_url
  } catch (err) {
    console.error('Cloudinary upload error:', err)
    return null
  }
}

export async function uploadFromFormData(
  formData: FormData,
  fieldName: string,
  folder: string
): Promise<string | null> {
  const file = formData.get(fieldName) as File | null
  if (!file || file.size === 0) return null
  const buffer = Buffer.from(await file.arrayBuffer())
  return uploadImage(buffer, folder)
}

export default cloudinary
