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