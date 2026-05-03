import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await prisma.cartItem.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.paymentMethod.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.user.deleteMany()
  await prisma.restaurant.deleteMany()

  const hashedPassword = await bcrypt.hash('password123', 12)

  // ─── Restaurants ────────────────────────────────────────────────────────────
  const spiceGarden = await prisma.restaurant.create({
    data: {
      name: 'Spice Garden',
      country: "INDIA" as const,
      description: 'Authentic North Indian cuisine with rich curries and tandoor specialties.',
      cuisineType: 'North Indian',
      address: 'Connaught Place, New Delhi',
      adminEmail: 'nick.fury@shield.com',
      imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
    },
  })

  const mumbaiMasala = await prisma.restaurant.create({
    data: {
      name: 'Mumbai Masala',
      country: "INDIA" as const,
      description: 'Street food inspired dishes from the heart of Mumbai.',
      cuisineType: 'Street Food',
      address: 'Bandra West, Mumbai',
      adminEmail: 'nick.fury@shield.com',
      imageUrl: 'https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=800',
    },
  })

  const burgerRepublic = await prisma.restaurant.create({
    data: {
      name: 'Burger Republic',
      country: "AMERICA" as const,
      description: 'Craft burgers, hand-cut fries, and premium milkshakes.',
      cuisineType: 'American',
      address: '5th Avenue, New York',
      adminEmail: 'nick.fury@shield.com',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    },
  })

  const starlightGrill = await prisma.restaurant.create({
    data: {
      name: 'Starlight Grill',
      country: "AMERICA" as const,
      description: 'Fine dining American classics with a modern twist.',
      cuisineType: 'Fine Dining',
      address: 'Sunset Blvd, Los Angeles',
      adminEmail: 'nick.fury@shield.com',
      imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    },
  })

  // ─── Users ──────────────────────────────────────────────────────────────────
  const nickFury = await prisma.user.create({
    data: {
      name: 'Nick Fury',
      email: 'nick.fury@shield.com',
      password: hashedPassword,
      role: "ADMIN" as const,
      country: "AMERICA" as const,
    },
  })

  const captainMarvel = await prisma.user.create({
    data: {
      name: 'Captain Marvel',
      email: 'captain.marvel@shield.com',
      password: hashedPassword,
      role: "MANAGER" as const,
      country: "INDIA" as const,
      restaurantId: spiceGarden.id,
    },
  })

  const captainAmerica = await prisma.user.create({
    data: {
      name: 'Captain America',
      email: 'captain.america@shield.com',
      password: hashedPassword,
      role: "MANAGER" as const,
      country: "AMERICA" as const,
      restaurantId: burgerRepublic.id,
    },
  })

  const thanos = await prisma.user.create({
    data: {
      name: 'Thanos',
      email: 'thanos@shield.com',
      password: hashedPassword,
      role: "MEMBER" as const,
      country: "INDIA" as const,
      restaurantId: spiceGarden.id,
    },
  })

  const thor = await prisma.user.create({
    data: {
      name: 'Thor',
      email: 'thor@shield.com',
      password: hashedPassword,
      role: "MEMBER" as const,
      country: "INDIA" as const,
      restaurantId: mumbaiMasala.id,
    },
  })

  const travis = await prisma.user.create({
    data: {
      name: 'Travis',
      email: 'travis@shield.com',
      password: hashedPassword,
      role: "MEMBER" as const,
      country: "AMERICA" as const,
      restaurantId: burgerRepublic.id,
    },
  })

  // ─── Menu Items ─────────────────────────────────────────────────────────────
  const spiceMenuItems = await Promise.all([
    prisma.menuItem.create({ data: { name: 'Butter Chicken', description: 'Creamy tomato-based curry with tender chicken pieces', price: 320, category: 'Main Course', restaurantId: spiceGarden.id, imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' } }),
    prisma.menuItem.create({ data: { name: 'Dal Makhani', description: 'Slow-cooked black lentils in rich buttery gravy', price: 240, category: 'Main Course', restaurantId: spiceGarden.id, imageUrl: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400' } }),
    prisma.menuItem.create({ data: { name: 'Garlic Naan', description: 'Freshly baked bread with garlic and butter', price: 60, category: 'Breads', restaurantId: spiceGarden.id } }),
    prisma.menuItem.create({ data: { name: 'Paneer Tikka', description: 'Grilled cottage cheese marinated in spiced yogurt', price: 280, category: 'Starters', restaurantId: spiceGarden.id } }),
    prisma.menuItem.create({ data: { name: 'Tandoori Chicken', description: 'Chicken marinated overnight in spices, cooked in clay oven', price: 360, category: 'Main Course', restaurantId: spiceGarden.id } }),
    prisma.menuItem.create({ data: { name: 'Mango Lassi', description: 'Sweet yogurt drink blended with Alphonso mangoes', price: 80, category: 'Beverages', restaurantId: spiceGarden.id } }),
    prisma.menuItem.create({ data: { name: 'Gulab Jamun', description: 'Soft milk-solid balls soaked in rose flavored syrup', price: 90, category: 'Desserts', restaurantId: spiceGarden.id } }),
  ])

  await Promise.all([
    prisma.menuItem.create({ data: { name: 'Vada Pav', description: 'Spiced potato fritter in soft bun with chutneys', price: 40, category: 'Street Food', restaurantId: mumbaiMasala.id } }),
    prisma.menuItem.create({ data: { name: 'Pav Bhaji', description: 'Spiced vegetable mash served with butter-toasted rolls', price: 120, category: 'Street Food', restaurantId: mumbaiMasala.id, imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400' } }),
    prisma.menuItem.create({ data: { name: 'Pani Puri', description: 'Crispy hollow shells filled with spiced water and potatoes', price: 60, category: 'Starters', restaurantId: mumbaiMasala.id } }),
    prisma.menuItem.create({ data: { name: 'Misal Pav', description: 'Spicy sprouted moth beans curry with pav bread', price: 110, category: 'Main Course', restaurantId: mumbaiMasala.id } }),
    prisma.menuItem.create({ data: { name: 'Mumbai Masala Chai', description: 'Spiced milk tea with cardamom and ginger', price: 30, category: 'Beverages', restaurantId: mumbaiMasala.id } }),
  ])

  await Promise.all([
    prisma.menuItem.create({ data: { name: 'Classic Cheeseburger', description: 'Angus beef patty, aged cheddar, lettuce, tomato, special sauce', price: 1200, category: 'Burgers', restaurantId: burgerRepublic.id, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' } }),
    prisma.menuItem.create({ data: { name: 'BBQ Bacon Burger', description: 'Smoky BBQ sauce, crispy bacon, onion rings, jalapeños', price: 1450, category: 'Burgers', restaurantId: burgerRepublic.id } }),
    prisma.menuItem.create({ data: { name: 'Hand-Cut Fries', description: 'Crispy golden fries seasoned with sea salt and herbs', price: 550, category: 'Sides', restaurantId: burgerRepublic.id } }),
    prisma.menuItem.create({ data: { name: 'Chocolate Milkshake', description: 'Thick shake made with premium Belgian chocolate ice cream', price: 700, category: 'Beverages', restaurantId: burgerRepublic.id } }),
    prisma.menuItem.create({ data: { name: 'Chicken Wings', description: '12 pieces buffalo wings with blue cheese dipping sauce', price: 1100, category: 'Starters', restaurantId: burgerRepublic.id } }),
    prisma.menuItem.create({ data: { name: 'Veggie Burger', description: 'House-made black bean patty with avocado and sprouts', price: 1050, category: 'Burgers', restaurantId: burgerRepublic.id } }),
  ])

  await Promise.all([
    prisma.menuItem.create({ data: { name: 'New York Strip Steak', description: '12oz prime cut, served with truffle mashed potatoes', price: 4200, category: 'Mains', restaurantId: starlightGrill.id } }),
    prisma.menuItem.create({ data: { name: 'Lobster Bisque', description: 'Creamy Atlantic lobster soup with a sherry cream finish', price: 1800, category: 'Starters', restaurantId: starlightGrill.id } }),
    prisma.menuItem.create({ data: { name: 'Caesar Salad', description: 'Crisp romaine, house-made Caesar dressing, anchovy, croutons', price: 1200, category: 'Salads', restaurantId: starlightGrill.id } }),
    prisma.menuItem.create({ data: { name: 'Crème Brûlée', description: 'Classic French custard with a perfectly caramelized sugar crust', price: 900, category: 'Desserts', restaurantId: starlightGrill.id } }),
    prisma.menuItem.create({ data: { name: 'Grilled Salmon', description: 'Atlantic salmon with lemon caper butter and asparagus', price: 3200, category: 'Mains', restaurantId: starlightGrill.id } }),
  ])

  // ─── Payment Methods ─────────────────────────────────────────────────────────
  await prisma.paymentMethod.create({
    data: {
      type: "CARD" as const,
      restaurantId: spiceGarden.id,
      details: { label: 'Visa / Mastercard', acceptedNetworks: ['VISA', 'MASTERCARD', 'RUPAY'], currency: 'INR' },
    },
  })
  await prisma.paymentMethod.create({
    data: {
      type: "UPI" as const,
      restaurantId: spiceGarden.id,
      details: { upiId: 'spicegarden@upi', qrCode: null, currency: 'INR' },
    },
  })
  await prisma.paymentMethod.create({
    data: {
      type: "CARD" as const,
      restaurantId: mumbaiMasala.id,
      details: { label: 'Credit / Debit Card', acceptedNetworks: ['VISA', 'MASTERCARD'], currency: 'INR' },
    },
  })
  await prisma.paymentMethod.create({
    data: {
      type: "QR" as const,
      restaurantId: mumbaiMasala.id,
      details: { label: 'Scan & Pay', qrImageUrl: null, currency: 'INR' },
    },
  })
  await prisma.paymentMethod.create({
    data: {
      type: "CARD" as const,
      restaurantId: burgerRepublic.id,
      details: { label: 'Credit / Debit Card', acceptedNetworks: ['VISA', 'MASTERCARD', 'AMEX'], currency: 'USD' },
    },
  })
  await prisma.paymentMethod.create({
    data: {
      type: "WALLET" as const,
      restaurantId: burgerRepublic.id,
      details: { label: 'Apple Pay / Google Pay', providers: ['APPLE_PAY', 'GOOGLE_PAY'], currency: 'USD' },
    },
  })
  await prisma.paymentMethod.create({
    data: {
      type: "CARD" as const,
      restaurantId: starlightGrill.id,
      details: { label: 'All Major Cards', acceptedNetworks: ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER'], currency: 'USD' },
    },
  })

  console.log('✅ Seed complete!')
  console.log('')
  console.log('Demo accounts (all passwords: password123)')
  console.log('─────────────────────────────────────────')
  console.log(`Admin   : nick.fury@shield.com        (sees all countries)`)
  console.log(`Manager : captain.marvel@shield.com   (India)`)
  console.log(`Manager : captain.america@shield.com  (America)`)
  console.log(`Member  : thanos@shield.com            (India)`)
  console.log(`Member  : thor@shield.com              (India)`)
  console.log(`Member  : travis@shield.com            (America)`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
