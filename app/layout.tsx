import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'Password Validator',
  description: 'NFA Model for Password Validation',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className='dark' lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider disableTransitionOnChange defaultTheme='system'>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
