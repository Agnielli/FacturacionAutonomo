import { auth } from "@/auth"

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req

  const isAuthRoute = nextUrl.pathname.startsWith('/login') || 
                      nextUrl.pathname.startsWith('/recuperar-password') ||
                      nextUrl.pathname.startsWith('/reset-password') ||
                      nextUrl.pathname.startsWith('/api/auth')

  if (isAuthRoute) {
    if (isLoggedIn && nextUrl.pathname === '/login') {
      return Response.redirect(new URL('/', nextUrl))
    }
    return undefined
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL('/login', nextUrl))
  }

  return undefined
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
