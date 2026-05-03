import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/api-helpers'
import { getCountryFilter } from '@/lib/rbac'
import { uploadFromFormData } from '@/lib/cloudinary'

export const GET = withAuth(async (req, user) => {
  const countryFilter = getCountryFilter(user)
  const restaurants = await prisma.restaurant.findMany({
    where: { isActive: true, ...(countryFilter ? { country: countryFilter } : {}) },
    include: { _count: { select: { menuItems: true, orders: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return apiResponse(restaurants)
})

const CreateRestaurantSchema = z.object({
  name: z.string().min(2),
  country: z.enum(['INDIA', 'AMERICA']),
  description: z.string().optional(),
  cuisineType: z.string().optional(),
  address: z.string().optional(),
})

export const POST = withAuth(async (req, user) => {
  if (user.role !== 'ADMIN') return apiError('Only admins can create restaurants', 403)

  const contentType = req.headers.get('content-type') || ''
  let body: Record<string, string>
  let imageUrl: string | null = null

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    body = Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === 'string')) as Record<string, string>
    imageUrl = await uploadFromFormData(formData, 'image', 'slooze/restaurants')
  } else {
    body = await req.json()
  }

  const parsed = CreateRestaurantSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.issues.map(e => e.message).join(', '), 422)

  const restaurant = await prisma.restaurant.create({
    data: { ...parsed.data, adminEmail: user.email, imageUrl },
  })
  return apiResponse(restaurant, 201)
})
