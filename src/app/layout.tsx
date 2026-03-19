import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Jarvis Corunda — AI Marketing Platform',
  description: 'Plataforma de automatización de marketing con IA',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#0A0A0F] text-[#FAFAFA]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
