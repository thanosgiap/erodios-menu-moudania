import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name as string
      }
      return session
    },
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        try {
          const manager = await prisma.manager.findUnique({
            where: { username: credentials.username as string },
          })
          console.log('Manager found:', !!manager)

          if (!manager) return null

          const valid = await bcrypt.compare(
            credentials.password as string,
            manager.password
          )
          console.log('Password valid:', valid)

          if (!valid) return null

          return { id: String(manager.id), name: manager.username }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
})