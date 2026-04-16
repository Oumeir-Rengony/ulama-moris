import { getBayaanBySlug } from "@/services/bayaans/bayaan.service"
import { ImageResponse } from "next/og"
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'


// Image metadata
export const alt = 'Ulama Moris'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/jpeg';


export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  const [ElMessiri, { data }] = await Promise.all([
    readFile(join(process.cwd(), 'public/font/ElMessiri-SemiBold.ttf')),
    getBayaanBySlug({ slug }),
  ]);


  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          justifyContent: "center",
          position: 'relative',
          fontFamily: "El Messiri, sans-serif",
          fontWeight: "bold"

        }}>



        <img src={`${process.env.NEXT_PUBLIC_SITE_URL}/og.jpg`} width={1200} height={630} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '768px',
            position: 'absolute',
            top: '20%',
            transform: 'translateY(-50%)',
            color: '#fff',
            textAlign: 'center'
          }}>

          <h1
            style={{
              fontSize: '72px',
              color: '#fff',
              padding: '0 4px',
              lineHeight: 1
            }}
          >
            {data?.metaTitle}
          </h1>


        </div>

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: '8%'
          }}
        >
          <p
            style={{
              fontSize: '36px',
              color: '#fff'
            }}
          >
            By { data?.author }
          </p>
        </div>

      </div>
    ), {
    ...size,


    fonts: [{
      name: 'El Messiri',
      data: ElMessiri,
      style: 'normal',
      weight: 600
    }]
  }
  )
}