import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminHash = await bcrypt.hash('Admin@123', 12)
  const clientHash = await bcrypt.hash('Client@123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@mantrataxbooks.com' },
    update: {},
    create: {
      email: 'admin@mantrataxbooks.com',
      name: 'Super Admin',
      passwordHash: adminHash,
      role: UserRole.ADMIN,
    },
  })

  const client = await prisma.user.upsert({
    where: { email: 'demo@client.com' },
    update: {},
    create: {
      email: 'demo@client.com',
      name: 'Demo Client',
      phone: '+91 98765 43210',
      company: 'Demo Pvt Ltd',
      passwordHash: clientHash,
      role: UserRole.CLIENT,
    },
  })

  const support = await prisma.user.upsert({
    where: { email: 'support@mantrataxbooks.com' },
    update: {},
    create: {
      email: 'support@mantrataxbooks.com',
      name: 'Support Staff',
      passwordHash: await bcrypt.hash('Support@123', 12),
      role: UserRole.SUPPORT,
    },
  })

  console.log('Seeded:', { admin: admin.email, client: client.email, support: support.email })
  console.log('Credentials:')
  console.log('  Admin:   admin@mantrataxbooks.com / Admin@123')
  console.log('  Client:  demo@client.com / Client@123')
  console.log('  Support: support@mantrataxbooks.com / Support@123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
