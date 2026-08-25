import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const userAgent = req.headers.get("user-agent") || ""

  // Descobre se o visitante está usando um celular [1, 2]
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

  // Se NÃO for celular, o site bloqueia o computador com uma mensagem
  if (!isMobile) {
    return new NextResponse("Acesso permitido apenas via celular.", { status: 403 })
  }

  // Se for celular, o seu sistema de login do Admin continua funcionando igual antes
  if (pathname.startsWith("/admin/login") || pathname.startsWith("/api/admin")) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/admin")) {
    const session = req.cookies.get("admin_session")?.value
    if (session !== "authenticated") {
      const url = req.nextUrl.clone()
      url.pathname = "/admin/login"
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// Isso diz ao Next.js em quais páginas esse bloqueador deve rodar
export const config = {
  matcher: [
    "/",              // Bloqueia computador na página inicial do site
    "/admin/:path*",  // Mantém a segurança do seu painel admin
  ],
}
