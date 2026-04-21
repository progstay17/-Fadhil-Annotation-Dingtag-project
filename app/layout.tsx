import type { Metadata } from 'next'
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { LanguageProvider } from '@/components/language-provider'
import './globals.css'

const ibmPlexSans = IBM_Plex_Sans({ 
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans"
});

const ibmPlexMono = IBM_Plex_Mono({ 
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: 'DingTag Annotation tool - Fast Text Processing for Annotation & QC',
  description: 'Specialized workflow system for annotators. Optimized for high-speed transcription and quality control.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/ait-logo.png',
      },
    ],
    apple: '/ait-logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <SpeedInsights />
      </body>
    </html>
  )
}
