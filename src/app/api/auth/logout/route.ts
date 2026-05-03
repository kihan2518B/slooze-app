import { apiResponse } from '@/lib/api-helpers'
import { NextRequest } from 'next/server'

export async function POST(_request: NextRequest) {
  const response = apiResponse({ message: 'Logged out successfully' })
  response.cookies.set('auth_token', '', { maxAge: 0, path: '/' })
  return response
}
