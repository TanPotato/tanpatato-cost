import type { FinanceRecord } from "./types";

const STORAGE_KEY = "tanpotato.finance-record.v1";

/**
 * 기록은 쓰는 사람의 브라우저에만 남는다. 개인 도구라 서버로 보내지 않는다.
 * 저장이 막힌 브라우저에서도 화면은 그대로 동작해야 하므로 실패를 삼킨다.
 */
export function loadRecord(): FinanceRecord | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FinanceRecord) : null;
  } catch {
    return null;
  }
}

export function saveRecord(record: FinanceRecord): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // 저장하지 못해도 이번 세션의 화면은 계속 쓸 수 있다.
  }
}
