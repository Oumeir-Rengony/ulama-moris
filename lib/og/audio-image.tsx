import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

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
        <p
          style={{
            margin: "48px 0 0",
            width: "100%",
            flexShrink: 0,
            fontSize: 32,
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
      )}
    </div>
  );
}

export async function createAudioOgImage(props: AudioImageProps) {
  const [background, font] = await assets;
  const fonts = [{ name: "El Messiri", data: font, style: "normal" as const, weight: 600 as const }];
  let titleFontSize = 72;
  if (props.title.length > 60) {
    titleFontSize = 60;
  }
  if (props.title.length > 100) {
    titleFontSize = 48;
  }
  if (props.title.length > 160) {
    titleFontSize = 40;
  }
  if (props.title.length > 240) {
    titleFontSize = 36;
  }

  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: 1200, height: 630 }}>
        <img alt="" src={`data:image/jpeg;base64,${background.toString("base64")}`} width={1200} height={630} />
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: "30%",
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
