import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { hashPassword, signToken } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/api-helpers'
import { uploadFromFormData } from '@/lib/cloudinary'

const RegisterSchema = z.object({
  restaurantName: z.string().min(2),
  country: z.enum(['INDIA', 'AMERICA']),
  adminName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  restaurantDescription: z.string().optional(),
  cuisineType: z.string().optional(),
  address: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let body: Record<string, string>
    let imageUrl: string | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      body = Object.fromEntries(
        [...formData.entries()].filter(([, v]) => typeof v === 'string')
      ) as Record<string, string>
      imageUrl = await uploadFromFormData(formData, 'restaurantImage', 'slooze/restaurants')
    } else {
      body = await request.json()
    }

    const parsed = RegisterSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues.map(e => e.message).join(', '), 422)
    }

    const { restaurantName, country, adminName, email, password, restaurantDescription, cuisineType, address } = parsed.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return apiError('Email already registered', 409)

    const hashedPassword = await hashPassword(password)

    const restaurant = await prisma.restaurant.create({
      data: { name: restaurantName, country, adminEmail: email, description: restaurantDescription, cuisineType, address, imageUrl },
    })

    const user = await prisma.user.create({
      data: { name: adminName, email, password: hashedPassword, role: 'ADMIN', country, restaurantId: restaurant.id },
    })

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN',
      country: user.country as 'INDIA' | 'AMERICA',
      restaurantId: user.restaurantId,
      name: user.name,
    })

    const response = apiResponse({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, country: user.country },
      restaurant,
      token,
    })
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  } catch (err) {
    console.error(err)
    return apiError('Registration failed', 500)
  }
}
