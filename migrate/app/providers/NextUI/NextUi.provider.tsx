
'use client'

import { NextUIProvider } from "@nextui-org/system";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function NextUiProvider({children}: { children: React.ReactNode }) {
  
    const router = useRouter();

    return (
        <NextUIProvider navigate={router.push}>
            {children}
        </NextUIProvider>
    )
}

export default NextUiProvider;