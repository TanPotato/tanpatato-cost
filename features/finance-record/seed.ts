import type { FinanceRecord, Profile } from "./types";

/**
 * 지난 기록을 읽어 온 뒤에도 겹치지 않아야 한다. 세는 수를 쓰면 새로고침할 때
 * 수만 0으로 돌아가고 저장된 id는 그대로여서 같은 id가 두 번 나온다.
 */
export function nextId(prefix: string): string {
  const suffix =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}-${suffix}`;
}

function blankProfile(): Profile {
  return {
    age: "",
    yearsToRetirement: "",
    dependents: [],
    goals: [],
    horizonYears: 7,
    riskLevel: 3,
    retirementGoalAmount: 0,
  };
}

/** 테스트와 계산의 기준이 되는 빈 기록. */
export function emptyRecord(): FinanceRecord {
  return {
    incomes: [],
    expenses: [],
    assets: [],
    debts: [],
    profile: blankProfile(),
  };
}

/**
 * 처음 열었을 때 놓이는 기본 항목. 금액은 비어 있고, 이름은 바꾸거나 지울 수 있다.
 * 빈 화면 앞에서 무엇부터 적어야 할지 막히지 않게 하려는 것이다.
 */
export function startingRecord(): FinanceRecord {
  return {
    incomes: [{ id: nextId("income"), name: "급여(세후)", amount: 0, cycle: "month" }],
    expenses: [
      { id: nextId("expense"), name: "주택담보대출 이자", amount: 0, cycle: "month" },
      { id: nextId("expense"), name: "아파트 관리비", amount: 0, cycle: "month" },
      { id: nextId("expense"), name: "통신비", amount: 0, cycle: "month" },
      { id: nextId("expense"), name: "식비·생활비", amount: 0, cycle: "month" },
    ],
    assets: [],
    debts: [],
    profile: blankProfile(),
  };
}
