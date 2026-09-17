import { monthlyAmount } from "./calculate";
import { formatHorizon, formatPercent, formatWon, withRo } from "./format";
import type { Diagnosis, FinanceRecord, Note, RankedExpense, Summary } from "./types";

/** 이 금리를 넘는 대출은 투자보다 먼저 갚는 쪽이 유리할 수 있다고 짚는다. */
export const HIGH_RATE_THRESHOLD = 5;

/** 투자금을 묶어 둘 수 있는 기간으로 고를 수 있는 햇수. */
export const HORIZON_CHOICES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20] as const;

const LONGEST_HORIZON = HORIZON_CHOICES[HORIZON_CHOICES.length - 1];

function rankExpenses(record: FinanceRecord, monthlyExpense: number): RankedExpense[] {
  return record.expenses
    .map((entry) => ({
      id: entry.id,
      name: entry.name.trim() || "이름 없는 항목",
      rawAmount: entry.amount,
      cycle: entry.cycle,
      monthlyAmount: monthlyAmount(entry),
      share: monthlyExpense > 0 ? monthlyAmount(entry) / monthlyExpense : 0,
    }))
    .filter((entry) => entry.monthlyAmount > 0)
    .sort((a, b) => b.monthlyAmount - a.monthlyAmount);
}

function buildNotes(record: FinanceRecord, summary: Summary): Note[] {
  const notes: Note[] = [];

  if (summary.monthlySurplus >= 0) {
    const rate = summary.savingRate === null ? "0.0%" : formatPercent(summary.savingRate);
    notes.push({
      id: "surplus",
      kind: "surplus",
      tone: "neutral",
      text: `매달 남는 ${formatWon(summary.monthlySurplus)}이 투자에 쓸 수 있는 최대치입니다. 저축률은 ${rate}입니다.`,
    });
  } else {
    notes.push({
      id: "deficit",
      kind: "deficit",
      tone: "warn",
      text: `매달 ${formatWon(Math.abs(summary.monthlySurplus))}이 모자랍니다. 투자를 늘리기 전에 지출을 먼저 손봐야 합니다.`,
    });
  }

  const irregular = record.expenses.filter(
    (entry) => entry.cycle !== "month" && entry.amount > 0
  );
  if (irregular.length > 0) {
    const converted = irregular.reduce((total, entry) => total + monthlyAmount(entry), 0);
    notes.push({
      id: "irregular",
      kind: "irregular",
      tone: "neutral",
      text: `1년에 한두 번 나가는 항목 ${irregular.length}건을 월 ${formatWon(converted)}으로 환산해 반영했습니다. 이걸 빼고 보면 매달 남는 돈이 그만큼 많아 보입니다.`,
    });
  }

  const horizon = formatHorizon(record.profile.horizonYears, LONGEST_HORIZON);
  for (const goal of record.profile.goals) {
    const yearsAway = Number(goal.yearsAway);
    if (!yearsAway || goal.amount <= 0 || yearsAway > record.profile.horizonYears) continue;

    const label = goal.name.trim() || "목돈 지출";
    notes.push({
      id: `goal-${goal.id}`,
      kind: "goal",
      tone: "warn",
      text: `${yearsAway}년 후 ${label}${withRo(label)} ${formatWon(goal.amount)}이 필요합니다. 묶어 둘 수 있다고 하신 ${horizon} 안에 써야 할 돈이니 따로 떼어 두어야 합니다.`,
    });
  }

  for (const debt of record.debts) {
    const rate = Number(debt.rate);
    if (!rate || rate < HIGH_RATE_THRESHOLD || debt.amount <= 0) continue;

    notes.push({
      id: `debt-${debt.id}`,
      kind: "high-rate-debt",
      tone: "warn",
      text: `${debt.name.trim() || "대출"} 금리가 ${debt.rate}%입니다. 기대수익이 이보다 낮은 투자라면 먼저 갚는 쪽이 낫습니다.`,
    });
  }

  if (!summary.hasBalanceRecord) {
    notes.push({
      id: "balance-missing",
      kind: "balance-missing",
      tone: "neutral",
      text: "자산과 부채를 아직 적지 않으셨습니다. 적으면 순자산과 은퇴까지의 여유가 함께 보입니다.",
    });
  }

  return notes;
}

export function diagnose(record: FinanceRecord, summary: Summary): Diagnosis {
  return {
    rankedExpenses: rankExpenses(record, summary.monthlyExpense),
    notes: buildNotes(record, summary),
  };
}
