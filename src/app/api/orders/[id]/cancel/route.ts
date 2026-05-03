import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/api-helpers'
import { hasPermission, canAccessCountry } from '@/lib/rbac'

export const POST = withAuth(async (req, user, params) => {
  if (!hasPermission(user, 'cancel:order')) {
    return apiError('Members cannot cancel orders', 403)
  }

  const order = await prisma.order.findUnique({ where: { id: params?.id } })
  if (!order) return apiError('Order not found', 404)
  if (!canAccessCountry(user, order.country)) return apiError('Access denied', 403)
  if (order.status === 'CANCELLED') return apiError('Order already cancelled', 400)
  if (order.status === 'DELIVERED') return apiError('Cannot cancel delivered orders', 400)

  const updated = await prisma.order.update({
    where: { id: params?.id },
    data: { status: 'CANCELLED', paymentStatus: 'REFUNDED' },
    include: { items: { include: { menuItem: true } }, restaurant: true },
  })
  return apiResponse(updated)
})
