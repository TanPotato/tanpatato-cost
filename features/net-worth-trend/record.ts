import type { Snapshot } from "./types";

/** 오늘 날짜를 로컬 기준 YYYY-MM-DD로 낸다. UTC가 아니라 기기의 로컬 날짜다. */
export function todayKey(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 같은 날짜의 기록이 있으면 새 값으로 덮어써 하루 최대 한 건만 남긴다.
 * 없으면 새로 더한다. 항상 날짜 오름차순으로 정렬해 돌려준다.
 */
export function recordSnapshot(snapshots: Snapshot[], date: string, totalAssets: number): Snapshot[] {
  const withoutToday = snapshots.filter((snapshot) => snapshot.date !== date);
  return [...withoutToday, { date, totalAssets }].sort((a, b) => a.date.localeCompare(b.date));
}
