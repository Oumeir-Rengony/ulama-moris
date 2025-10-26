import { ReadonlyURLSearchParams } from "next/navigation";

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


export const formatTime = (time: number) => {
  // Hours, minutes and seconds
  const hrs = Math.floor(~~(time / 3600)); // eslint-disable-line
  const mins = Math.floor(~~((time % 3600) / 60)); // eslint-disable-line
  const secs = Math.floor(time % 60);

  // Output like "1:01" or "4:03:59" or "123:03:59"
  let ret = "";

  if (hrs > 0) {
    ret += `${hrs}:${mins < 10 ? "0" : ""}`;
  }

  ret += `${mins}:${secs < 10 ? "0" : ""}`;
  ret += `${secs}`;
  return ret;
};


export const getWhatsAppLink = (pathname: string, queryString: string) => {

  if(!queryString && !pathname){
    return
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://ulama-moris.org';

  //reset=1 is done so that social media consider it as a new url to refresh their cache
  const fullUrl = `${origin}${pathname}?${queryString.toString()}&reset=1`;
  return encodeURIComponent(fullUrl);
}

    
export const createQueryString = (searchParams: ReadonlyURLSearchParams, { 
  name, 
  value 
}: {
  name: string, 
  value: string
}) => {
  const params = new URLSearchParams(searchParams.toString())
  params.set(name, value)
  return params.toString()
}