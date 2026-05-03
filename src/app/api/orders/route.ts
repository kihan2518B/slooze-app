import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/api-helpers'
import { hasPermission, getCountryFilter } from '@/lib/rbac'

export const GET = withAuth(async (req, user) => {
  const countryFilter = getCountryFilter(user)
  const canViewAll = hasPermission(user, 'view:all_orders')

  const orders = await prisma.order.findMany({
    where: {
      ...(canViewAll ? {} : { userId: user.userId }),
      ...(countryFilter ? { country: countryFilter } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      restaurant: { select: { id: true, name: true } },
      items: { include: { menuItem: true } },
      paymentMethod: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return apiResponse(orders)
})

const PlaceOrderSchema = z.object({
  restaurantId: z.string(),
  paymentMethodId: z.string(),
  notes: z.string().optional(),
})

export const POST = withAuth(async (req, user) => {
  if (!hasPermission(user, 'place:order')) {
    return apiError('Members cannot place orders. A manager or admin must approve.', 403)
  }

  const body = await req.json()
  const parsed = PlaceOrderSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.issues.map(e => e.message).join(', '), 422)

  const restaurant = await prisma.restaurant.findUnique({ where: { id: parsed.data.restaurantId } })
  if (!restaurant) return apiError('Restaurant not found', 404)

  if (user.role !== 'ADMIN' && restaurant.country !== user.country) {
    return apiError('Cannot place orders at restaurants in a different country', 403)
  }

  const paymentMethod = await prisma.paymentMethod.findFirst({
    where: { id: parsed.data.paymentMethodId, restaurantId: parsed.data.restaurantId, isActive: true },
  })
  if (!paymentMethod) return apiError('Payment method not available', 400)

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.userId },
    include: { menuItem: true },
  })
  if (cartItems.length === 0) return apiError('Cart is empty', 400)

  const totalAmount = cartItems.reduce((sum: number, item: { menuItem: { price: number }; quantity: number }) => sum + item.menuItem.price * item.quantity, 0)

  const order = await prisma.order.create({
    data: {
      userId: user.userId,
      restaurantId: parsed.data.restaurantId,
      paymentMethodId: parsed.data.paymentMethodId,
      totalAmount,
      country: user.role === 'ADMIN' ? restaurant.country : user.country,
      status: 'PLACED',
      paymentStatus: 'COMPLETED',
      paymentRef: `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      notes: parsed.data.notes,
      items: {
        create: cartItems.map((c: { menuItemId: string; quantity: number; menuItem: { price: number } }) => ({
          menuItemId: c.menuItemId,
          quantity: c.quantity,
          price: c.menuItem.price,
        })),
      },
    },
    include: {
      items: { include: { menuItem: true } },
      restaurant: true,
      paymentMethod: true,
      user: { select: { id: true, name: true, email: true } },
    },
  })

  await prisma.cartItem.deleteMany({ where: { userId: user.userId } })
  return apiResponse(order, 201)
})
