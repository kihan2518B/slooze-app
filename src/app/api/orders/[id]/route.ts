import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/api-helpers'
import { canAccessCountry } from '@/lib/rbac'

export const GET = withAuth(async (req, user, params) => {
  const order = await prisma.order.findUnique({
    where: { id: params?.id },
    include: { items: { include: { menuItem: true } }, restaurant: true, paymentMethod: true, user: { select: { id: true, name: true, email: true } }, confirmedBy: { select: { id: true, name: true } } },
  })
  if (!order) return apiError('Order not found', 404)
  if (user.role === 'MEMBER' && order.userId !== user.userId) return apiError('Forbidden', 403)
  if (!canAccessCountry(user, order.country)) return apiError('Access denied', 403)
  return apiResponse(order)
})

export const PATCH = withAuth(async (req, user, params) => {
  if (user.role === 'MEMBER') return apiError('Forbidden', 403)
  const order = await prisma.order.findUnique({
    where: { id: params?.id },
  })
  if (!order) return apiError('Order not found', 404)
  if (!canAccessCountry(user, order.country)) return apiError('Access denied', 403)

  const body = await req.json()
  const { status, paymentStatus } = body

  // We allow managers/admins to confirm orders
  const updated = await prisma.order.update({
    where: { id: params!.id },
    data: {
      ...(status ? { status } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
      ...(status === 'PLACED' && !order.confirmedById ? { confirmedById: user.userId } : {})
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      restaurant: { select: { id: true, name: true } },
      items: { include: { menuItem: true } },
      paymentMethod: true,
      confirmedBy: { select: { id: true, name: true } }
    }
  })

  return apiResponse(updated)
})
