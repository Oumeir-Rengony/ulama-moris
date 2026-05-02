import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Header } from '@/components/header';
import Footer from '@/components/footer';
import { Toaster } from '@/components/ui/sonner';

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Ulama Moris - Listen to Quran, Hadith & Islamic Lectures',
  description: 'Learn Islam through Audio from Our Ulama. Listen to Quran, Hadith, and Islamic Lectures from respected scholars of Mauritius.',
  icons: "/logo-32.png",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ulama-moris.org"),
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL
  },
  openGraph: {
    title: 'Ulama Moris - Listen to Quran, Hadith & Islamic Lectures',
    description: 'Learn Islam through Audio from Our Ulama. Listen to Quran, Hadith, and Islamic Lectures from respected scholars of Mauritius.',
    siteName: "Ulama Moris",
    type: 'website',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    images: {
      url: "/logo.webp",
      alt: "Ulama Moris",
      width: 541,
      height: 541
    }
  }
}


export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        <Toaster />
        <Header />
        {children}
        <Footer />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
