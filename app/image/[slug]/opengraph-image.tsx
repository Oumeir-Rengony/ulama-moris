import { ImageResponse } from "next/og"
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'


// Image metadata
export const alt = 'Ulama Moris'
export const size = {
  width: 1200,
  height: 800,
}

export const contentType = 'image/png'


export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  // Font loading, process.cwd() is Next.js project directory
  const ElMessiri = await readFile(
    join(process.cwd(), 'public/font/ElMessiri-SemiBold.ttf')
  )

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
        <img src={`${process.env.NEXT_PUBLIC_SITE_URL}/bg1.jpg`} width={1200} height={800} />

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
              <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>
              <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>
            </g>
          </svg>

          <h1
            style={{
              fontSize: '72px',
              color: '#fff',
              padding: '0 4px'

            }}
          >
            {slug.replace(/-/g, " ")}
          </h1>
          
          <div style={{ display: 'flex', alignSelf: 'flex-end'}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path>
              <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path>
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
            Speaker
          </p>
        </div>
      </div>
    ), {
    ...size,
    fonts:[{
      name: 'El Messiri',
      data: ElMessiri,
      style: 'normal',
      weight: 600
    }]
  }
  )
}