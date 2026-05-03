import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getTokenFromRequest, JWTPayload } from './auth'
import { hasPermission, Permission } from './rbac'

export function apiResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export async function getAuthUser(request: NextRequest | Request): Promise<JWTPayload | null> {
  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token)
}

export async function requireAuth(request: NextRequest | Request): Promise<JWTPayload> {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  return user
}

// Next.js 15/16 passes params as Promise<Record<string,string>>
type RouteContext = { params?: Promise<Record<string, string>> | Record<string, string> }

export function withAuth(
  handler: (req: NextRequest, user: JWTPayload, params?: Record<string, string>) => Promise<NextResponse>,
  permission?: Permission
) {
  return async (req: NextRequest, context?: RouteContext) => {
    try {
      const user = await requireAuth(req)
      if (permission && !hasPermission(user, permission)) {
        return apiError('Forbidden: insufficient permissions', 403)
      }
      // Resolve params whether they are a Promise or plain object
      let resolvedParams: Record<string, string> | undefined
      if (context?.params) {
        resolvedParams = context.params instanceof Promise ? await context.params : context.params
      }
      return await handler(req, user, resolvedParams)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Server error'
      if (msg === 'Unauthorized') return apiError('Unauthorized', 401)
      if (msg.startsWith('Forbidden')) return apiError(msg, 403)
      console.error(err)
      return apiError('Internal server error', 500)
    }
  }
}
