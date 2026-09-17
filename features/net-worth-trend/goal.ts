export type GoalProgress = {
  /** 은퇴 목표 총자산을 적었는지. 0이면 미설정으로 본다. */
  hasGoal: boolean;
  /** 지금 총자산 ÷ 목표. 목표가 없으면 null. */
  progressRatio: number | null;
  /** 은퇴까지 남은 기간을 적었는지. */
  hasTimeframe: boolean;
  /** 지금 페이스(매달 남는 돈)가 그대로 이어질 때 은퇴 시점 예상 총자산. */
  projectedTotal: number | null;
  /** 예상 총자산이 목표 이상인지. 목표나 기간이 없으면 null. */
  meetsGoal: boolean | null;
};

const MONTHS_PER_YEAR = 12;

/**
 * 은퇴 목표 총자산 대비 진행률과, 지금 페이스로 목표에 닿을지를 계산한다.
 * 투자 수익률은 넣지 않는다 — 매달 남는 돈이 그대로 이어진다고만 가정한다.
 */
export function calculateGoalProgress({
  currentTotal,
  goalAmount,
  monthlySurplus,
  yearsToRetirement,
}: {
  currentTotal: number;
  goalAmount: number;
  monthlySurplus: number;
  yearsToRetirement: number | null;
}): GoalProgress {
  const hasGoal = goalAmount > 0;
  const hasTimeframe = yearsToRetirement !== null;

  if (!hasGoal) {
    return { hasGoal, progressRatio: null, hasTimeframe, projectedTotal: null, meetsGoal: null };
  }

  const progressRatio = currentTotal / goalAmount;

  if (!hasTimeframe) {
    return { hasGoal, progressRatio, hasTimeframe, projectedTotal: null, meetsGoal: null };
  }

  const months = yearsToRetirement * MONTHS_PER_YEAR;
  const projectedTotal = currentTotal + monthlySurplus * months;
  const meetsGoal = projectedTotal >= goalAmount;

  return { hasGoal, progressRatio, hasTimeframe, projectedTotal, meetsGoal };
}
