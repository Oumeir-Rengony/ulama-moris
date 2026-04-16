import { Quote } from "lucide-react";
import { Metadata } from "next";
import { El_Messiri } from "next/font/google";

const _Messiri = El_Messiri({ subsets: ["latin"] });



export const metadata: Metadata = {
   title: 'THE PATH TO SPIRITUAL AWAKENING',
   description: 'Learn Islam through Audio from Our Ulama. Listen to Quran, Hadith, and Islamic Lectures from respected scholars of Mauritius.',
   icons: "/logo-32.png",
   metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ulama-moris.org"),
   alternates: {
      canonical: process.env.NEXT_PUBLIC_SITE_URL
   },
   openGraph: {
      title: 'THE PATH TO SPIRITUAL AWAKENING',
      description: 'Learn Islam through Audio from Our Ulama. Listen to Quran, Hadith, and Islamic Lectures from respected scholars of Mauritius.',
      siteName: "Ulama Moris",
      type: 'website',
      url: process.env.NEXT_PUBLIC_SITE_URL,
   }
}


export default async function Page({
   params,
}: {
   params: Promise<{ slug: string }>
}) {

   const { slug } = await params;

   return (
       <div
        style={{
          display: 'flex',
          justifyContent: "center",
          position: 'relative',
          fontFamily: "El Messiri, sans-serif",
          fontWeight: "bold"

        }}>

        <img src={`${process.env.NEXT_PUBLIC_SITE_URL}/og.jpg`} width={1200} height={800} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '768px',
            position: 'absolute',
            top: '40%',
            transform: 'translateY(-50%)',
            color: '#fff',
            textAlign: 'center'
          }}>

          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <g transform="scale(-1, 1) translate(-24, 0)">
              <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
              <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
            </g>
          </svg>

          <h1
            style={{
              fontSize: '72px',
              color: '#fff',
              padding: '0 4px',
              lineHeight: 1
            }}
          >
            {slug.replace(/-/g, " ")}
          </h1>

          <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <g transform="scale(1, 1)">
                <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
                <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
              </g>
            </svg>
          </div>

        </div>

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: '12.5%'
          }}
        >
          <p
            style={{
              fontSize: '30px',
              color: '#fff'
            }}
          >
            Mufti Houzeifa Mamoojee
          </p>
        </div>

      </div>
   )

}