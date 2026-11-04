import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const assets = Promise.all([
  readFile(join(process.cwd(), "public/series og.jpg")),
  readFile(join(process.cwd(), "public/font/ElMessiri-Bold.ttf")),
  readFile(join(process.cwd(), "public/font/Geist-Bold.ttf")),
]);

export async function createEventOgImage({ title: eventTitle, total, date: recordingDate }: {
  title: string;
  total: number;
  date: string | null;
}) {
  const [background, titleFont, detailFont] = await assets;

  const dateMatch = eventTitle.match(
    /\s+[-–—]\s+((?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\s+)?\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})$/i,
  );
  let title = eventTitle;
  let date = recordingDate;
  if (dateMatch) {
    title = eventTitle.slice(0, dateMatch.index).trim();
    date = dateMatch[1];
  }

  let titleFontSize = 56;
  if (title.length > 65) {
    titleFontSize = 46;
  }
  if (title.length > 110) {
    titleFontSize = 36;
  }

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
            top: 100,
            left: 60,
            width: 710,
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "#ad913e",
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: 3,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ad913e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3 10 5-10 5L2 8l10-5Z" />
              <path d="m2 12 10 5 10-5M2 16l10 5 10-5" />
            </svg>
            AUDIO SERIES
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: titleFontSize,
              fontWeight: 700,
              lineHeight: 1.14,
              letterSpacing: -1.2,
              maxHeight: 180,
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
                fontSize: 24,
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
              marginTop: 30,
              padding: "8px 17px",
              borderRadius: 999,
              backgroundColor: "#006e16",
              color: "#ffffff",
              fontSize: 16,
              fontFamily: "Geist",
              fontWeight: 400,
              letterSpacing: 1,
            }}
          >
            {total} {total === 1 ? "Lecture" : "Lectures"}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 53,
            left: 60,
          }}
        >
          <span style={{ color: "#738a78", fontSize: 16 }}>ulama-moris.org</span>
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
