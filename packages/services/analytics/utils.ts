export const DAY_MS = 24 * 60 * 60 * 1000;

export function durationMs(start?: Date | string | null, end?: Date | string | null) {
  if (!start || !end) return null;
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  if (Number.isNaN(startTime) || Number.isNaN(endTime) || endTime < startTime) return null;
  return endTime - startTime;
}

export function average(values: Array<number | null | undefined>) {
  const usable = values.filter((value): value is number => typeof value === "number");
  if (usable.length === 0) return null;
  return Math.round(usable.reduce((sum, value) => sum + value, 0) / usable.length);
}

export function daysBetween(start?: Date | string | null, end: Date = new Date()) {
  const value = durationMs(start, end);
  return value === null ? null : value / DAY_MS;
}
