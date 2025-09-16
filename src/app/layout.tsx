
import './globals.css'
import Header from '@/components/common/header'
import ReactQueryProvider from '@/app/providers/react-query-provider'
import { getSession } from '@/lib/auth'
import { Toaster } from 'sonner'



export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Italiana&family=Lato:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <ReactQueryProvider>
          {session.user?.id ? <Header /> : null}
          <main>
            {children}
          </main>
          <Toaster richColors position="top-right" />
        </ReactQueryProvider>
      </body>
    </html>
  )
}
