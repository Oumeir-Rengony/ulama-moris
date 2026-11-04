export function getOgTitleFontSize(title: string): number {
  if (title.length > 240) {
    return 36;
  }
  if (title.length > 160) {
    return 40;
  }
  if (title.length > 100) {
    return 48;
  }
  if (title.length > 60) {
    return 60;
  }
  return 72;
}
