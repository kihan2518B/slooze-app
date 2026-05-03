import { NextRequest } from 'next/server'
import { apiResponse, apiError, getAuthUser } from '@/lib/api-helpers'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return apiError('Unauthorized', 401)

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { id: true, name: true, email: true, role: true, country: true, restaurantId: true, createdAt: true },
  })
  if (!dbUser) return apiError('User not found', 404)
  return apiResponse(dbUser)
}
