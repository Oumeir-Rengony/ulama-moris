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
      <div className="flex justify-center relative" style={{ fontFamily: "El Messiri, sans-serif", fontWeight: "bold" }}>
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
               <Quote
                  style={{
                     transform: 'rotateY(180deg)',
                     // verticalAlign: 'top'
                  }}
                  size={32}
               />
               <h1
                  style={{
                     fontSize: '72px',
                     color: '#fff',
                     padding: '0 4px'

                  }}
               >
                  {slug.replace(/-/g, " ")}
               </h1>
               <Quote
                  style={{
                     alignSelf: 'flex-end'
                  }}
                  size={32}
               />
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
      </div>
   )

}