import type { FinanceRecord, FlowEntry, Summary } from "./types";

/** 한 번 나가는 사이에 흐르는 개월 수. 월 환산은 입력값을 이 수로 나눈 값이다. */
export const MONTHS_PER_CYCLE = {
  month: 1,
  quarter: 3,
  half: 6,
  year: 12,
} as const;

export function monthlyAmount(entry: FlowEntry): number {
  return entry.amount / MONTHS_PER_CYCLE[entry.cycle];
}

function sumMonthly(entries: FlowEntry[]): number {
  return entries.reduce((total, entry) => total + monthlyAmount(entry), 0);
}

function sumAmount(entries: { amount: number }[]): number {
  return entries.reduce((total, entry) => total + entry.amount, 0);
}

export function summarize(record: FinanceRecord): Summary {
  const monthlyIncome = sumMonthly(record.incomes);
  const monthlyExpense = sumMonthly(record.expenses);
  const monthlySurplus = monthlyIncome - monthlyExpense;
  const assetTotal = sumAmount(record.assets);
  const debtTotal = sumAmount(record.debts);

  return {
    monthlyIncome,
    monthlyExpense,
    monthlySurplus,
    savingRate: monthlyIncome > 0 ? monthlySurplus / monthlyIncome : null,
    assetTotal,
    debtTotal,
    netWorth: assetTotal - debtTotal,
    hasBalanceRecord: record.assets.length > 0 || record.debts.length > 0,
    isBlank: monthlyIncome === 0 && monthlyExpense === 0,
  };
}
