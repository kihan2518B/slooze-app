import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/api-helpers'
import { canAccessCountry } from '@/lib/rbac'
import { uploadFromFormData } from '@/lib/cloudinary'

export const GET = withAuth(async (req, user, params) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: params?.id } })
  if (!restaurant) return apiError('Restaurant not found', 404)
  if (!canAccessCountry(user, restaurant.country as 'INDIA' | 'AMERICA')) return apiError('Access denied', 403)
  const items = await prisma.menuItem.findMany({ where: { restaurantId: params?.id, isAvailable: true } })
  return apiResponse(items)
})

const MenuItemSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  category: z.string().min(1),
})

export const POST = withAuth(async (req, user, params) => {
  if (user.role === 'MEMBER') return apiError('Forbidden', 403)
  const restaurant = await prisma.restaurant.findUnique({ where: { id: params?.id } })
  if (!restaurant) return apiError('Restaurant not found', 404)
  if (!canAccessCountry(user, restaurant.country as 'INDIA' | 'AMERICA')) return apiError('Access denied', 403)

  const contentType = req.headers.get('content-type') || ''
  let body: Record<string, string>
  let imageUrl: string | null = null

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    body = Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === 'string')) as Record<string, string>
    imageUrl = await uploadFromFormData(formData, 'image', 'slooze/menu')
  } else {
    body = await req.json()
  }

  const parsed = MenuItemSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.issues.map(e => e.message).join(', '), 422)

  const item = await prisma.menuItem.create({ data: { ...parsed.data, restaurantId: params!.id, imageUrl } })
  return apiResponse(item, 201)
})
