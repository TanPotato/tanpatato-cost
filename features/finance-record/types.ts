/** 항목이 얼마나 자주 들어오고 나가는지. 진단에서는 모두 월 기준으로 환산한다. */
export type CycleKey = "month" | "quarter" | "half" | "year";

export type FlowEntry = {
  id: string;
  name: string;
  amount: number;
  cycle: CycleKey;
};

export type AssetEntry = {
  id: string;
  name: string;
  amount: number;
};

export type DebtEntry = {
  id: string;
  name: string;
  amount: number;
  /** 사용자가 적은 그대로 둔다. 소수점을 찍는 도중에도 값이 사라지지 않아야 한다. */
  rate: string;
};

export type GoalEntry = {
  id: string;
  name: string;
  amount: number;
  yearsAway: string;
};

/**
 * 부양가족. 자녀와 부모님은 인원까지 하나의 값으로 고른다. 부모님을 한 분만
 * 부양하는지 두 분 다 부양하는지에 따라 부담 규모가 다르므로 "부모님" 하나로
 * 뭉치지 않는다. 각 묶음 안에서는 하나만 함께 설 수 있다.
 */
export type DependentKey =
  | "spouse"
  | "child-1"
  | "child-2"
  | "child-3plus"
  | "parent-1"
  | "parent-2";

export type RiskLevel = 1 | 2 | 3 | 4 | 5;

export type Profile = {
  age: string;
  yearsToRetirement: string;
  dependents: DependentKey[];
  goals: GoalEntry[];
  /** 투자금을 묶어 둘 수 있는 햇수. 20은 20년 이상을 뜻한다. */
  horizonYears: number;
  riskLevel: RiskLevel;
  /** 은퇴 목표 총자산. GLOSSARY.md 참고 — GoalEntry의 "목표"와는 다른 개념이다. 0은 미설정이다. */
  retirementGoalAmount: number;
};

export type FinanceRecord = {
  incomes: FlowEntry[];
  expenses: FlowEntry[];
  assets: AssetEntry[];
  debts: DebtEntry[];
  profile: Profile;
};

export type Summary = {
  monthlyIncome: number;
  monthlyExpense: number;
  monthlySurplus: number;
  /** 월 수입이 없으면 낼 수 없다. */
  savingRate: number | null;
  assetTotal: number;
  debtTotal: number;
  netWorth: number;
  hasBalanceRecord: boolean;
  isBlank: boolean;
};

export type RankedExpense = {
  id: string;
  name: string;
  rawAmount: number;
  cycle: CycleKey;
  monthlyAmount: number;
  /** 월 환산 지출 합계에서 이 항목이 차지하는 비율. */
  share: number;
};

export type NoteKind =
  | "surplus"
  | "deficit"
  | "irregular"
  | "goal"
  | "high-rate-debt"
  | "balance-missing";

export type Note = {
  id: string;
  kind: NoteKind;
  tone: "neutral" | "warn";
  text: string;
};

export type Diagnosis = {
  rankedExpenses: RankedExpense[];
  notes: Note[];
};
