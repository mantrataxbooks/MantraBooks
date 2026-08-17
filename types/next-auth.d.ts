import { UserRole } from '@prisma/client'
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      needsTerms?: boolean
      impersonatedBy?: string
      delegateFor?: string
    }
  }
  interface User {
    id: string
    role: UserRole
    needsTerms?: boolean
    impersonatedBy?: string
    delegateFor?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    needsTerms?: boolean
    impersonatedBy?: string
    delegateFor?: string
  }
}
