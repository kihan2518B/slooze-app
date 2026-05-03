import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/api-helpers'

export const GET = withAuth(async (req, user) => {
  const items = await prisma.cartItem.findMany({
    include: { menuItem: { include: { restaurant: true } } },
  })
  return apiResponse(items)
})

const AddCartSchema = z.object({
  menuItemId: z.string(),
  quantity: z.number().int().min(1).default(1),
})

export const POST = withAuth(async (req, user) => {
  const body = await req.json()
  const parsed = AddCartSchema.safeParse(body)
  if (!parsed.success) return apiError('Invalid data', 422)

  const menuItem = await prisma.menuItem.findUnique({
    where: { id: parsed.data.menuItemId },
    include: { restaurant: true },
  })
  if (!menuItem) return apiError('Menu item not found', 404)

  // ReBAC: user can only add items from their country
  if (user.role !== 'ADMIN' && menuItem.restaurant.country !== user.country) {
    return apiError('Cannot add items from restaurants in a different country', 403)
  }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_menuItemId: { userId: user.userId, menuItemId: parsed.data.menuItemId } },
  })

  if (existing) {
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + parsed.data.quantity },
      include: { menuItem: true },
    })
    return apiResponse(updated)
  }

  const item = await prisma.cartItem.create({
    data: { userId: user.userId, menuItemId: parsed.data.menuItemId, quantity: parsed.data.quantity },
    include: { menuItem: true },
  })
  return apiResponse(item, 201)
})

export const DELETE = withAuth(async (req, user) => {
  const { searchParams } = new URL(req.url)
  const cartItemId = searchParams.get('id')
  const all = searchParams.get('all')

  if (all === 'true') {
    await prisma.cartItem.deleteMany({ where: { userId: user.userId } })
    return apiResponse({ message: 'Cart cleared' })
  }

  if (!cartItemId) return apiError('Cart item id required', 400)
  const item = await prisma.cartItem.findUnique({ where: { id: cartItemId } })
  if (!item || item.userId !== user.userId) return apiError('Not found', 404)
  await prisma.cartItem.delete({ where: { id: cartItemId } })
  return apiResponse({ message: 'Removed' })
})

export const PATCH = withAuth(async (req, user) => {
  const body = await req.json()
  const { cartItemId, quantity } = body
  if (!cartItemId || quantity < 0) return apiError('Invalid data', 422)

  if (quantity === 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } })
    return apiResponse({ message: 'Removed' })
  }

  const item = await prisma.cartItem.findUnique({ where: { id: cartItemId } })
  if (!item || item.userId !== user.userId) return apiError('Not found', 404)

  const updated = await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity }, include: { menuItem: true } })
  return apiResponse(updated)
})
