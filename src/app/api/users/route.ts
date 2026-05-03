import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/api-helpers'
import { hashPassword } from '@/lib/auth'

export const GET = withAuth(async (req, user) => {
  if (user.role !== 'ADMIN' && user.role !== 'MANAGER') return apiError('Forbidden', 403)
  const users = await prisma.user.findMany({
    where: user.role === 'MANAGER' ? { country: user.country } : {},
    select: { id: true, name: true, email: true, role: true, country: true, restaurantId: true, createdAt: true, restaurant: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return apiResponse(users)
})

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['MANAGER', 'MEMBER']),
  country: z.enum(['INDIA', 'AMERICA']),
  restaurantId: z.string().optional(),
})

export const POST = withAuth(async (req, user) => {
  if (user.role !== 'ADMIN' && user.role !== 'MANAGER') return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = CreateUserSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.issues.map(e => e.message).join(', '), 422)

  if (user.role === 'MANAGER' && parsed.data.country !== user.country) {
    return apiError('Managers can only create users in their country', 403)
  }
  if (user.role === 'MANAGER' && parsed.data.role !== 'MEMBER') {
    return apiError('Managers can only create Members', 403)
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) return apiError('Email already registered', 409)

  const hashed = await hashPassword(parsed.data.password)
  const newUser = await prisma.user.create({
    data: { ...parsed.data, password: hashed },
    select: { id: true, name: true, email: true, role: true, country: true, restaurantId: true },
  })
  return apiResponse(newUser, 201)
})
