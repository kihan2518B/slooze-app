import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/api-helpers'
import { canAccessCountry } from '@/lib/rbac'
import { z } from 'zod'
import { uploadFromFormData } from '@/lib/cloudinary'

export const GET = withAuth(async (req, user, params) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: params?.id },
    include: { menuItems: { where: { isAvailable: true } }, paymentMethods: { where: { isActive: true } } },
  })
  if (!restaurant) return apiError('Restaurant not found', 404)
  if (!canAccessCountry(user, restaurant.country as 'INDIA' | 'AMERICA')) return apiError('Access denied for this country', 403)
  return apiResponse(restaurant)
})

const UpdateRestaurantSchema = z.object({
  name: z.string().min(2).optional(),
  country: z.string().optional(),
  description: z.string().optional(),
  cuisineType: z.string().optional(),
  address: z.string().optional(),
})

export const PUT = withAuth(async (req, user, params) => {
  if (user.role !== 'ADMIN') return apiError('Only admins can update restaurants', 403)
  
  const restaurantId = params?.id
  const existing = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
  if (!existing) return apiError('Restaurant not found', 404)

  const contentType = req.headers.get('content-type') || ''
  let body: Record<string, string>
  let imageUrl: string | null = null

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    body = Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === 'string')) as Record<string, string>
    if (formData.has('image')) {
      imageUrl = await uploadFromFormData(formData, 'image', 'slooze/restaurants')
    }
  } else {
    body = await req.json()
  }

  const parsed = UpdateRestaurantSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.issues.map(e => e.message).join(', '), 422)

  const dataToUpdate: any = { ...parsed.data }
  if (imageUrl) dataToUpdate.imageUrl = imageUrl

  const updated = await prisma.restaurant.update({
    where: { id: restaurantId },
    data: dataToUpdate,
  })
  
  return apiResponse(updated)
})
