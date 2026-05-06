import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/api-helpers'
import { canAccessCountry } from '@/lib/rbac'

export const GET = withAuth(async (req, user, params) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: params?.id } })
  if (!restaurant) return apiError('Not found', 404)
  if (!canAccessCountry(user, restaurant.country as 'INDIA' | 'AMERICA')) return apiError('Access denied', 403)
  const methods = await prisma.paymentMethod.findMany({ where: { restaurantId: params?.id, isActive: true } })
  return apiResponse(methods)
})

const PaymentMethodSchema = z.object({
  type: z.enum(['CARD', 'QR', 'UPI', 'BANK_TRANSFER', 'WALLET']),
  details: z.record(z.string(), z.unknown()),
})

export const POST = withAuth(async (req, user, params) => {
  if (user.role !== 'ADMIN') return apiError('Only admins can manage payment methods', 403)
  const restaurant = await prisma.restaurant.findUnique({ where: { id: params?.id } })
  if (!restaurant) return apiError('Not found', 404)

  const body = await req.json()
  const parsed = PaymentMethodSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.issues.map(e => e.message).join(', '), 422)

  const method = await prisma.paymentMethod.create({ data: { ...parsed.data, details: parsed.data.details as any, restaurantId: params!.id } })
  return apiResponse(method, 201)
})

export const PUT = withAuth(async (req, user, params) => {
  if (user.role !== 'ADMIN') return apiError('Only admins can manage payment methods', 403)
  const body = await req.json()
  const { methodId, isActive, details, type } = body
  
  if (!methodId) return apiError('Method ID is required', 400)
  
  const updateData: any = {}
  if (isActive !== undefined) updateData.isActive = isActive
  if (details) updateData.details = details
  if (type) updateData.type = type

  const method = await prisma.paymentMethod.update({ where: { id: methodId }, data: updateData })
  return apiResponse(method)
})

export const DELETE = withAuth(async (req, user, params) => {
  if (user.role !== 'ADMIN') return apiError('Only admins can manage payment methods', 403)
  const { searchParams } = new URL(req.url)
  const methodId = searchParams.get('id')
  
  if (!methodId) return apiError('Method ID is required', 400)
  
  await prisma.paymentMethod.delete({ where: { id: methodId } })
  return apiResponse({ success: true, message: 'Payment method deleted' })
})
