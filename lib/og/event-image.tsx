import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getOgTitleFontSize } from "./title-font-size";

const assets = Promise.all([
  readFile(join(process.cwd(), "public/series og.jpg")),
  readFile(join(process.cwd(), "public/font/ElMessiri-Bold.ttf")),
  readFile(join(process.cwd(), "public/font/Geist-Bold.ttf")),
]);

const titleLineHeight = 1.1;
const maxTitleHeight = 180;

export async function createEventOgImage({ title, date }: {
  title: string;
  date: string | null;
}) {
  const [background, titleFont, detailFont] = await assets;

  const titleFontSize = getOgTitleFontSize(title);
  const maxTitleLines = Math.floor(maxTitleHeight / (titleFontSize * titleLineHeight));

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "100%",
          height: "100%",
          color: "#102e1b",
          fontFamily: "El Messiri",
          fontWeight: 700,
          backgroundColor: "#edf1e9",
        }}
      >
        <img
          alt=""
          src={`data:image/jpeg;base64,${background.toString("base64")}`}
          width={1200}
          height={630}
          style={{ position: "absolute", top: 0, left: 0 }}
        />

        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 72,
            left: 100,
            width: 710,
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: "#ad913e",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 4,
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ad913e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3 10 5-10 5L2 8l10-5Z" />
              <path d="m2 12 10 5 10-5M2 16l10 5 10-5" />
            </svg>
            AUDIO SERIES
          </div>
          <div
            style={{
              display: "block",
              width: "100%",
              flexShrink: 0,
              marginTop: 20,
              fontSize: titleFontSize,
              fontWeight: 700,
              lineHeight: titleLineHeight,
              letterSpacing: -1.2,
              lineClamp: maxTitleLines,
              overflow: "hidden",
              textOverflow: "ellipsis",
              wordBreak: "break-word",
            }}
          >
            {title}
          </div>
          {date && (
            <div
              style={{
                marginTop: 20,
                fontFamily: "Geist",
                fontSize: 26,
                fontWeight: 700,
                color: "#45634d",
              }}
            >
              {date}
            </div>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              width: 700,
              marginTop: 28,
              paddingTop: 22,
              borderTop: "1px solid #b8cdbb",
              color: "#102e1b",
              fontFamily: "Geist",
              fontWeight: 700,
            }}
          >
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#45634d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M3 14v-3a9 9 0 0 1 18 0v3" />
              <rect x="3" y="12" width="4" height="9" rx="2" />
              <rect x="17" y="12" width="4" height="9" rx="2" />
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 40, lineHeight: 1.2, letterSpacing: -0.6 }}>
                More talks on this topic
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 30, color: "#45634d" }}>
                Explore the audio collection
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#45634d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12h16m-6-6 6 6-6 6" />
                </svg>
              </div>
              <div style={{ fontSize: 26 }}>
                ulama-moris.org
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "El Messiri", data: titleFont, style: "normal", weight: 700 },
        { name: "Geist", data: detailFont, style: "normal", weight: 700 },
      ],
    },
  );
}
