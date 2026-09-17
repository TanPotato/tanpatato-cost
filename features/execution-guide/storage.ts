import type { StepId } from "./types";

const STORAGE_KEY = "tanpotato.execution-guide.v1";

/**
 * 체크한 단계 목록만 저장한다. finance-record의 기록 데이터와 섞이면 한쪽을
 * 지우려다 다른 쪽까지 건드리기 쉬워, 이 기능만의 저장소를 따로 둔다.
 */
export function loadCheckedSteps(): StepId[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as StepId[]) : [];
  } catch {
    return [];
  }
}

export function saveCheckedSteps(checked: StepId[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  } catch {
    // 저장하지 못해도 이번 세션의 화면은 계속 쓸 수 있다.
  }
}
