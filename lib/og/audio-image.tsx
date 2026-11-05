import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getOgTitleFontSize } from "./title-font-size";

const assets = Promise.all([
  readFile(join(process.cwd(), "public/og.jpg")),
  readFile(join(process.cwd(), "public/font/ElMessiri-SemiBold.ttf")),
]);

const contentWidth = 740;
const titleLineHeight = 1.1;
const maxTitleHeight = 240;

type AudioImageProps = { title: string; author?: string | null };

function renderText({ title, author }: AudioImageProps, fontSize: number) {
  const maxTitleLines = Math.floor(maxTitleHeight / (fontSize * titleLineHeight));
  return (
    <div
      id="audio-text"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: contentWidth,
        color: "#102e1b",
        fontFamily: "El Messiri",
        fontWeight: 600,
        textAlign: "center",
      }}
    >
      <h1
        id="audio-title"
        style={{
          margin: 0,
          width: "100%",
          flexShrink: 0,
          fontSize,
          textAlign: "center",
          justifyContent: "center",
          lineHeight: titleLineHeight,
          wordBreak: "break-word",
          display: "block",
          lineClamp: maxTitleLines,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {title}
      </h1>
      {author?.trim() && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <svg
            width="480"
            height="40"
            viewBox="0 0 600 50"
            fill="none"
            style={{ margin: "24px 0", flexShrink: 0 }}
          >
            <path d="M10 25H257M343 25H590" stroke="#ad965d" strokeWidth="4" strokeLinecap="round" />
            <polygon
              points="300,0 307,8 317,8 317,18 325,25 317,32 317,42 307,42 300,50 293,42 283,42 283,32 275,25 283,18 283,8 293,8"
              fill="#ad965d"
            />
            <polygon
              points="300,9 305,15 310,15 310,20 316,25 310,30 310,35 305,35 300,41 295,35 290,35 290,30 284,25 290,20 290,15 295,15"
              stroke="#e9e6d6"
              strokeWidth="0.8"
            />
          </svg>
          <p
            style={{
              margin: 0,
              width: "100%",
              flexShrink: 0,
              fontSize: 40,
              textAlign: "center",
              justifyContent: "center",
              lineHeight: 1.2,
              wordBreak: "break-word",
              display: "block",
              lineClamp: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            By {author}
          </p>
        </div>
      )}
    </div>
  );
}

export async function createAudioOgImage(props: AudioImageProps) {
  const [background, font] = await assets;
  const fonts = [{ name: "El Messiri", data: font, style: "normal" as const, weight: 600 as const }];
  const titleFontSize = getOgTitleFontSize(props.title);

  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: 1200, height: 630 }}>
        <img alt="" src={`data:image/jpeg;base64,${background.toString("base64")}`} width={1200} height={630} />
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: "25%",
            left: (1200 - contentWidth) / 2,
            width: contentWidth,
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {renderText(props, titleFontSize)}
        </div>
        <div style={{ display: "flex", position: "absolute", bottom: 53, right: 60, color: "#738a78", fontFamily: "El Messiri", fontWeight: 600, fontSize: 16 }}>
          ulama-moris.org
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts },
  );
}
