import type { Snapshot } from "./types";

const STORAGE_KEY = "tanpotato.net-worth-trend.v1";

/**
 * 기록 포인트만 저장한다. 다른 기능의 저장소와 섞으면 한쪽을 지우려다
 * 다른 쪽까지 건드리기 쉬워, 이 기능만의 저장소를 따로 둔다.
 */
export function loadSnapshots(): Snapshot[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Snapshot[]) : [];
  } catch {
    return [];
  }
}

export function saveSnapshots(snapshots: Snapshot[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
  } catch {
    // 저장하지 못해도 이번 세션의 화면은 계속 쓸 수 있다.
  }
}
