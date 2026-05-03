import { JWTPayload } from './auth'

export type Permission =
  | 'view:restaurants'
  | 'view:menu'
  | 'create:order'
  | 'place:order'
  | 'cancel:order'
  | 'manage:payment_methods'
  | 'view:all_orders'
  | 'view:own_orders'
  | 'manage:users'
  | 'manage:restaurants'

type Role = 'ADMIN' | 'MANAGER' | 'MEMBER'
type Country = 'INDIA' | 'AMERICA'

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    'view:restaurants', 'view:menu', 'create:order', 'place:order', 'cancel:order',
    'manage:payment_methods', 'view:all_orders', 'view:own_orders', 'manage:users', 'manage:restaurants',
  ],
  MANAGER: [
    'view:restaurants', 'view:menu', 'create:order', 'place:order', 'cancel:order',
    'view:all_orders', 'view:own_orders',
  ],
  MEMBER: ['view:restaurants', 'view:menu', 'create:order', 'view:own_orders'],
}

export function hasPermission(user: JWTPayload, permission: Permission): boolean {
  return ROLE_PERMISSIONS[user.role].includes(permission)
}

export function canAccessCountry(user: JWTPayload, targetCountry: Country): boolean {
  if (user.role === 'ADMIN') return true
  return user.country === targetCountry
}

export function getCountryFilter(user: JWTPayload): Country | undefined {
  if (user.role === 'ADMIN') return undefined
  return user.country
}
