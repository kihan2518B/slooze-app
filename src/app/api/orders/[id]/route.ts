import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/api-helpers'
import { canAccessCountry } from '@/lib/rbac'

export const GET = withAuth(async (req, user, params) => {
  const order = await prisma.order.findUnique({
    where: { id: params?.id },
    include: { items: { include: { menuItem: true } }, restaurant: true, paymentMethod: true, user: { select: { id: true, name: true, email: true } } },
  })
  if (!order) return apiError('Order not found', 404)
  if (user.role === 'MEMBER' && order.userId !== user.userId) return apiError('Forbidden', 403)
  if (!canAccessCountry(user, order.country)) return apiError('Access denied', 403)
  return apiResponse(order)
})
