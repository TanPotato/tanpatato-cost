import { describe, expect, test } from "vitest";

import { calculateGoalProgress } from "./goal";

describe("calculateGoalProgress", () => {
  test("목표가 0(미설정)이면 아무것도 계산하지 않는다", () => {
    const result = calculateGoalProgress({
      currentTotal: 10_000_000,
      goalAmount: 0,
      monthlySurplus: 1_000_000,
      yearsToRetirement: 10,
    });

    expect(result.hasGoal).toBe(false);
    expect(result.progressRatio).toBeNull();
    expect(result.projectedTotal).toBeNull();
    expect(result.meetsGoal).toBeNull();
  });

  test("목표만 있고 은퇴까지 남은 기간이 없으면 진행률만 낸다", () => {
    const result = calculateGoalProgress({
      currentTotal: 250_000_000,
      goalAmount: 500_000_000,
      monthlySurplus: 1_000_000,
      yearsToRetirement: null,
    });

    expect(result.hasGoal).toBe(true);
    expect(result.progressRatio).toBeCloseTo(0.5);
    expect(result.hasTimeframe).toBe(false);
    expect(result.projectedTotal).toBeNull();
    expect(result.meetsGoal).toBeNull();
  });

  test("목표와 기간이 모두 있으면 예상 은퇴 시점 총자산과 도달 여부를 낸다", () => {
    const result = calculateGoalProgress({
      currentTotal: 100_000_000,
      goalAmount: 400_000_000,
      monthlySurplus: 2_500_000,
      yearsToRetirement: 10,
    });

    // 100,000,000 + 2,500,000 * 120개월 = 400,000,000
    expect(result.projectedTotal).toBe(400_000_000);
    expect(result.meetsGoal).toBe(true);
  });

  test("지금 페이스로는 목표에 못 미치면 meetsGoal이 false다", () => {
    const result = calculateGoalProgress({
      currentTotal: 100_000_000,
      goalAmount: 1_000_000_000,
      monthlySurplus: 1_000_000,
      yearsToRetirement: 5,
    });

    expect(result.projectedTotal).toBe(160_000_000); // 100,000,000 + 1,000,000*60
    expect(result.meetsGoal).toBe(false);
  });

  test("매달 남는 돈이 적자여도 예상치를 그대로 계산한다", () => {
    const result = calculateGoalProgress({
      currentTotal: 100_000_000,
      goalAmount: 200_000_000,
      monthlySurplus: -500_000,
      yearsToRetirement: 2,
    });

    expect(result.projectedTotal).toBe(88_000_000); // 100,000,000 - 500,000*24
    expect(result.meetsGoal).toBe(false);
  });

  test("은퇴까지 남은 기간이 0년이면 지금 총자산과 같다", () => {
    const result = calculateGoalProgress({
      currentTotal: 300_000_000,
      goalAmount: 500_000_000,
      monthlySurplus: 1_000_000,
      yearsToRetirement: 0,
    });

    expect(result.projectedTotal).toBe(300_000_000);
    expect(result.meetsGoal).toBe(false);
  });
});
