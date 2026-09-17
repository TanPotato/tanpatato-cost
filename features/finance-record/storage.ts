import { emptyRecord } from "./seed";
import type { FinanceRecord } from "./types";

const STORAGE_KEY = "tanpotato.finance-record.v1";

/**
 * 저장된 기록이 지금 쓰는 모양보다 오래됐을 수 있다. 빠진 자리는 빈 값으로 채워
 * 이미 적어 둔 금액을 잃지 않게 하고, 화면이 없는 값을 읽다 멈추지 않게 한다.
 */
function reconcile(stored: Partial<FinanceRecord> | null): FinanceRecord {
  const blank = emptyRecord();
  if (!stored) return blank;

  return {
    incomes: stored.incomes ?? blank.incomes,
    expenses: stored.expenses ?? blank.expenses,
    assets: stored.assets ?? blank.assets,
    debts: stored.debts ?? blank.debts,
    profile: { ...blank.profile, ...stored.profile },
  };
}

/**
 * 기록은 쓰는 사람의 브라우저에만 남는다. 개인 도구라 서버로 보내지 않는다.
 * 저장이 막힌 브라우저에서도 화면은 그대로 동작해야 하므로 실패를 삼킨다.
 */
export function loadRecord(): FinanceRecord | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? reconcile(JSON.parse(raw) as Partial<FinanceRecord>) : null;
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
