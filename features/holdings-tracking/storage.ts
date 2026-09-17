import type { Holding } from "./types";

const STORAGE_KEY = "tanpotato.holdings-tracking.v1";

/**
 * 보유 종목만 저장한다. finance-record나 execution-guide의 저장소와 섞이면
 * 한쪽을 지우려다 다른 쪽까지 건드리기 쉬워, 이 기능만의 저장소를 따로 둔다.
 */
export function loadHoldings(): Holding[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Holding[]) : [];
  } catch {
    return [];
  }
}

export function saveHoldings(holdings: Holding[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
  } catch {
    // 저장하지 못해도 이번 세션의 화면은 계속 쓸 수 있다.
  }
}

/** 지난 기록을 불러온 뒤에도 겹치지 않아야 한다. */
export function nextId(): string {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `holding-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
