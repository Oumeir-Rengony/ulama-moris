import type { AppProps } from "next/app";
import { NextUIProvider } from "@nextui-org/system";

import "public/styles/bootstrap-grid/bootstrap-grid.min.css";
import "public/styles/global.css";
import { useRouter } from "next/router";


export default function App({ Component, pageProps }: AppProps) {

  const router = useRouter();

  return  (
    <NextUIProvider navigate={router.push}>
      <Component {...pageProps} />
    </NextUIProvider>
  )
}
