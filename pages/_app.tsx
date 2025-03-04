import type { AppProps } from "next/app";
import { HeroUIProvider } from "@heroui/system";
import { Analytics } from "@vercel/analytics/react";
import { useRouter } from "next/router";


import "public/styles/bootstrap-grid/bootstrap-grid.min.css";
import "public/styles/global.css";


import localFont from 'next/font/local'


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


export default function App({ Component, pageProps }: AppProps) {

  const router = useRouter();

  return  (
    <HeroUIProvider navigate={router.push}>
      <main className={`${Objektiv.className} light`}>
        <Component {...pageProps} />
        <Analytics/>
      </main>
    </HeroUIProvider>
  )
}
