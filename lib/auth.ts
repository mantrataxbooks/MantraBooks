import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { UserRole } from '@prisma/client'

// Fail fast at startup if the secret is missing or left as placeholder
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET
if (!NEXTAUTH_SECRET || NEXTAUTH_SECRET === 'change-this-to-random-32-char-string') {
  throw new Error(
    '[auth] NEXTAUTH_SECRET is not set or is still the default placeholder. ' +
    'Generate a real secret with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"'
  )
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const googleProviders = process.env.GOOGLE_CLIENT_ID
  ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ]
  : []

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    ...googleProviders,
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        impersonateToken: { label: 'Impersonate Token', type: 'text' },
      },
      async authorize(credentials) {
        // Impersonation flow
        if (credentials?.impersonateToken) {
          try {
            const imp = await prisma.impersonationToken.findUnique({
              where: { token: credentials.impersonateToken },
              include: { client: true },
            })
            if (imp && !imp.used && imp.expiresAt >= new Date()) {
              await prisma.impersonationToken.update({ where: { id: imp.id }, data: { used: true } })
              return {
                id: imp.clientId,
                email: imp.client.email,
                name: imp.client.name,
                role: 'CLIENT' as UserRole,
                impersonatedBy: imp.adminId,
              }
            }
          } catch (e) {
            console.error('Impersonation token query error:', e)
          }
          return null
        }

        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const emailLower = parsed.data.email.toLowerCase()
        const passwordInput = parsed.data.password

        // Database user check — only valid, active users with a hashed password
        try {
          const user = await prisma.user.findUnique({ where: { email: emailLower } })
          if (user && user.passwordHash && user.isActive) {
            const valid = await bcrypt.compare(passwordInput, user.passwordHash)
            if (valid) {
              return { id: user.id, email: user.email, name: user.name, role: user.role }
            }
          }
        } catch (dbErr) {
          console.error('Database query error during login:', dbErr)
        }

        return null
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'google' && profile?.email) {
        try {
          const existing = await prisma.user.findUnique({ where: { email: profile.email } })
          if (existing && !existing.isActive) return false
        } catch (e) {
          console.error('Google sign-in check error:', e)
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      // Google OAuth
      if (account?.provider === 'google' && user?.email) {
        try {
          let dbUser = await prisma.user.findUnique({ where: { email: user.email } })
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name ?? user.email.split('@')[0],
                passwordHash: null,
                emailVerified: true,
                role: UserRole.CLIENT,
                isActive: true,
              },
            })
          }
          token.id = dbUser.id
          token.role = dbUser.role
          token.needsTerms = !dbUser.termsAccepted
          return token
        } catch (e) {
          console.error('Google OAuth DB sync error:', e)
          token.id = user.id
          token.role = UserRole.CLIENT
          return token
        }
      }

      // Credentials sign-in
      if (user) {
        token.id = user.id
        token.role = user.role
        if (user.impersonatedBy) {
          token.impersonatedBy = user.impersonatedBy
        } else {
          try {
            const delegation = await prisma.delegation.findFirst({
              where: { delegateId: user.id, status: 'ACTIVE' },
            })
            if (delegation) token.delegateFor = delegation.ownerId
          } catch (e) {
            // DB delegation query safe fallback
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        if (token.needsTerms) session.user.needsTerms = true
        if (token.impersonatedBy) session.user.impersonatedBy = token.impersonatedBy as string
        if (token.delegateFor) session.user.delegateFor = token.delegateFor as string
      }
      return session
    },
  },
}
