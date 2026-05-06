export type Role = 'ADMIN' | 'MANAGER' | 'MEMBER'
export type Country = 'INDIA' | 'AMERICA'
export type OrderStatus = 'PENDING' | 'PLACED' | 'CANCELLED' | 'DELIVERED'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
export type PaymentType = 'CARD' | 'QR' | 'UPI' | 'BANK_TRANSFER' | 'WALLET'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  country: Country
  restaurantId: string | null
}

export interface Restaurant {
  id: string
  name: string
  country: Country
  description?: string
  imageUrl?: string
  cuisineType?: string
  address?: string
  isActive: boolean
  adminEmail: string
  _count?: { menuItems: number; orders: number }
}

export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  category: string
  isAvailable: boolean
  restaurantId: string
}

export interface PaymentMethod {
  id: string
  type: PaymentType
  isActive: boolean
  restaurantId: string
  details: Record<string, unknown>
}

export interface CartItem {
  id: string
  quantity: number
  menuItem: MenuItem & { restaurant: Restaurant }
}

export interface OrderItem {
  id: string
  quantity: number
  price: number
  menuItem: MenuItem
}

export interface Order {
  id: string
  status: OrderStatus
  totalAmount: number
  paymentStatus: PaymentStatus
  paymentRef?: string
  notes?: string
  country: Country
  createdAt: string
  updatedAt: string
  user?: Pick<User, 'id' | 'name' | 'email'>
  restaurant: Pick<Restaurant, 'id' | 'name'>
  items: OrderItem[]
  paymentMethod?: PaymentMethod
  confirmedBy?: Pick<User, 'id' | 'name'> | null
}


export interface JWTPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "MEMBER";
  country: "INDIA" | "AMERICA";
  restaurantId: string | null;
  name: string;
}