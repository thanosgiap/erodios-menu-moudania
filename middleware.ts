export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName: process.env.NODE_ENV === 'production' 
      ? '__Secure-authjs.session-token'
      : 'authjs.session-token',
  })

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}