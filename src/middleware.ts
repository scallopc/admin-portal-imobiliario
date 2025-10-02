import { NextRequest, NextResponse } from "next/server";

function isPublicPath(pathname: string): boolean {
  // Rotas públicas que não precisam de autenticação
  const publicPaths = [
    "/authentication",
    "/api/auth/sign-in",
    "/api/ai", // Permitir todas as rotas de IA
    "/api/releases", // Permitir todas as rotas de releases
    "/api/leads", // Permitir todas as rotas de leads
    "/api/links", // Permitir todas as rotas de links
    "/api/properties", // Permitir todas as rotas de properties
    "/api/dashboard", // Permitir dashboard
    "/api/cep", // Permitir CEP
    "/api/email", // Permitir email
    "/api/upload", // Permitir upload
    "/api/tools", // Permitir tools
    "/api/delete", // Permitir delete
    "/api/migrate", // Permitir migrate
    "/api/pdf", // Permitir PDF
    "/_next",
    "/favicon.ico",
    "/images",
    "/public"
  ];
  
  // Verificar se é uma rota pública
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return true;
  }
  
  // Permitir arquivos estáticos (imagens, ícones, etc.)
  if (pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)) {
    return true;
  }
  
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  
  console.log('🔒 Middleware checking:', pathname);
  
  if (isPublicPath(pathname)) {
    console.log('✅ Public path, allowing:', pathname);
    return NextResponse.next();
  }

  const session = req.cookies.get("session")?.value;
  console.log('🍪 Session cookie exists:', !!session);
  
  if (session) {
    console.log('✅ Session found, allowing:', pathname);
    return NextResponse.next();
  }

  console.log('❌ No session, redirecting to authentication for:', pathname);
  const callbackUrl = encodeURIComponent(pathname + (search || ""));
  const url = new URL(`/authentication?callbackUrl=${callbackUrl}`, req.url);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Proteger todas as rotas exceto as especificadas
    "/((?!_next/static|_next/image|favicon.ico|authentication|images|public|api|.*\\.).*)",
  ],
};
