import { clsx, type ClassValue } from 'clsx'
import { HTTP_METHOD } from 'next/dist/server/web/http';
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toISODuration = (timeStr: string) => {
  if (!timeStr) return;

  const parts = timeStr.split(":").map(Number);

  let hours = 0, minutes = 0, seconds = 0;

  if (parts.length === 3) {
    [hours, minutes, seconds] = parts;
  } else if (parts.length === 2) {
    [minutes, seconds] = parts;
  } else {
    throw new Error("Invalid time format. Use HH:MM:SS or MM:SS.");
  }

  let iso = "PT";
  if (hours) iso += hours + "H";
  if (minutes) iso += minutes + "M";
  if (seconds) iso += seconds + "S";

  return iso;
}


export const toTitleCase = (str: string) => {

  if (typeof str !== 'string' || str.length === 0) {
    return str; // Handle empty strings or non-string inputs
  }

  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}


export function formatTime(time: number) {
  if (isNaN(time) || !isFinite(time)) return "0:00"

  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = Math.floor(time % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}


export const getWhatsAppLink = (pathname: string, queryString: string) => {

  if (!queryString && !pathname) {
    return
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://ulama-moris.org';

  //reset=1 is done so that social media consider it as a new url to refresh their cache
  const fullUrl = `${origin}${pathname}?${queryString.toString()}&reset=1`;
  return encodeURIComponent(fullUrl);
}

export const cleanDescription = (html?: string) => {
  if (!html || html === "<p><br></p>" || html === "<p></p>") {
    return "";
  }
  return html;
};


export function createQueryString(
  searchParams: URLSearchParams,
  updates: Record<string, string | null>
) {
  const params = new URLSearchParams(searchParams.toString())

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
  })

  return params.toString()
}

export const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const arrayify = (input: string | string[] | undefined): string[] => {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input.filter((item): item is string => typeof item === "string");
  }

  if (typeof input === "string") {
    return [input];
  }

  return []; // reject anything else (object, number, etc.)
}


export async function getCanonicalRequest(req: Request, body: string){
  return {
    path: new URL(req.url).pathname,
    method: req.method as HTTP_METHOD,
    headers: Object.fromEntries(req.headers),
    body,
  };
}