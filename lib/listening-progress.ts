import CONFIG from "@/config/config.json";

// Where each lecture was paused, saved in the browser as { [trackId]: seconds }.
//
// localStorage can fail in normal use: it can be full, blocked (private mode,
// strict privacy settings) or hold data we did not write. Losing a saved
// position must never stop playback, so every failure here is contained.

const STORAGE_KEY = CONFIG.localstorageKey.audioTime;

type ProgressMap = Record<string, number>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readProgressMap(): ProgressMap {
  let parsed: unknown;
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) {
      return {};
    }
    parsed = JSON.parse(savedData);
  } catch {
    return {};
  }

  if (!isPlainObject(parsed)) {
    return {};
  }

  const progressMap: ProgressMap = {};
  for (const [trackId, seconds] of Object.entries(parsed)) {
    if (typeof seconds === "number") {
      progressMap[trackId] = seconds;
    }
  }
  return progressMap;
}

function writeProgressMap(progressMap: ProgressMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressMap));
  } catch (error) {
    console.warn("Could not save listening progress", error);
  }
}

export function getTrackProgress(trackId: string): number {
  const progressMap = readProgressMap();
  return progressMap[trackId] || 0;
}

export function saveProgress(trackId: string, time: number) {
  const progressMap = readProgressMap();
  progressMap[trackId] = time;
  writeProgressMap(progressMap);
}

export function removeProgress(trackId: string) {
  const progressMap = readProgressMap();
  delete progressMap[trackId];
  writeProgressMap(progressMap);
}
