import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/api-helpers'
import { canAccessCountry } from '@/lib/rbac'

export const GET = withAuth(async (req, user, params) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: params?.id },
    include: { menuItems: { where: { isAvailable: true } }, paymentMethods: { where: { isActive: true } } },
  })
  if (!restaurant) return apiError('Restaurant not found', 404)
  if (!canAccessCountry(user, restaurant.country as 'INDIA' | 'AMERICA')) return apiError('Access denied for this country', 403)
  return apiResponse(restaurant)
})
