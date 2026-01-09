import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname

  // Si no hay token y la ruta es /menu, redirige al login
  if (!token && pathname === '/menu') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si hay token y está en /menu, permite el acceso con headers
  if (token && pathname === '/menu') {
    const response = NextResponse.next()
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'no-referrer')
    response.headers.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()')
    response.headers.set('Content-Security-Policy', "default-src 'self'; object-src 'none';")
    return response
  }

  // Para todas las demás rutas, permite el acceso con headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'no-referrer')
  response.headers.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()')
  response.headers.set('Content-Security-Policy', "default-src 'self'; object-src 'none';")
  return response
}

export const config = {
  matcher: ['/:path*'] // Aplica el middleware a todas las rutas
}
