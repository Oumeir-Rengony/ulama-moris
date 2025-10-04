import { Metadata, Viewport } from "next";
import localFont from 'next/font/local';
import { HeroProvider } from "./_components/hero-provider";
import { Analytics } from "@vercel/analytics/next";
import config from "@config/config.json";
import "public/styles/bootstrap-grid/bootstrap-grid.min.css";
import "public/styles/global.css";

const Objektiv = localFont({
  src: [
    {
      path: '../public/fonts/objektivmk3_regular.woff2',
      weight: '400',
      style: 'normal',
      
    },
    {
      path: '../public/fonts/objektivmk3_regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/objektivmk3_bold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/objektivmk3_bold.woff',
      weight: '600',
      style: 'normal',
    }
  ],
  preload: true,
  display: 'swap'
});



export const metadata: Metadata = {
    title: config.meta.title,
    description: config.meta.description,
    icons: "/favicon.ico",
    alternates: {
      canonical: "https://www.ulama-moris.org/"
    },
    // keywords: [],
    // author: "",
    openGraph: {
        title: config.meta.title,
        description: config.meta.description,
        siteName: "Ulama Moris",
        type: 'website',
        url: 'https://ulama-moris.org',
        images: {
            width: 900,
            height: 600,
            url: 'https://www.ulama-moris.org/og1.png'
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
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en-MU">
      <head />
      <body className={`${Objektiv.className} antialiased`}>
        <HeroProvider themeProps={{ attribute: "class", defaultTheme: "light" }}>
            <main>              
                {children}
                {/* <Analytics mode="production" /> */}
            </main>
        </HeroProvider>
      </body>
    </html>
  );
}