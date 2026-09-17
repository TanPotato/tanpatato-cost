import { describe, expect, test } from "vitest";

import { allocate } from "@/features/portfolio-recommendation";

function sumPercent(lines: { percent: number }[]) {
  return lines.reduce((total, line) => total + line.percent, 0);
}

function sumAmount(lines: { amount: number }[]) {
  return lines.reduce((total, line) => total + line.amount, 0);
}

describe("allocate", () => {
  test("성향 3단계·기간 7년은 상한 없이 주식:채권 50:50이다", () => {
    const result = allocate({ riskLevel: 3, horizonYears: 7, monthlySurplus: 1_000_000 });

    expect(result.baseStockPercent).toBe(50);
    expect(result.finalStockPercent).toBe(50);
    expect(result.horizonCapApplied).toBe(false);
  });

  test("성향 5단계·기간 1년은 상한 60%에 걸려 60:40으로 낮아진다", () => {
    const result = allocate({ riskLevel: 5, horizonYears: 1, monthlySurplus: 1_000_000 });

    expect(result.baseStockPercent).toBe(80);
    expect(result.finalStockPercent).toBe(60);
    expect(result.horizonCapApplied).toBe(true);
  });

  test("성향 5단계·기간 3년은 상한 70%에 걸려 70:30으로 낮아진다", () => {
    const result = allocate({ riskLevel: 5, horizonYears: 3, monthlySurplus: 1_000_000 });

    expect(result.finalStockPercent).toBe(70);
    expect(result.horizonCapApplied).toBe(true);
  });

  test("성향 5단계·기간 5년 이상은 상한이 걸리지 않는다", () => {
    const result = allocate({ riskLevel: 5, horizonYears: 5, monthlySurplus: 1_000_000 });

    expect(result.finalStockPercent).toBe(80);
    expect(result.horizonCapApplied).toBe(false);
  });

  test("기본 비율이 이미 상한보다 낮으면 상한을 적용하지 않는다", () => {
    // 1단계 기본 20%는 1년 상한 60%보다 이미 낮다.
    const result = allocate({ riskLevel: 1, horizonYears: 1, monthlySurplus: 1_000_000 });

    expect(result.finalStockPercent).toBe(20);
    expect(result.horizonCapApplied).toBe(false);
  });

  test("항상 정확히 3줄, 카테고리는 국내주식형·해외주식형·채권형 순서다", () => {
    const result = allocate({ riskLevel: 3, horizonYears: 7, monthlySurplus: 1_000_000 });

    expect(result.lines.map((l) => l.category)).toEqual([
      "domestic-equity",
      "overseas-equity",
      "bond",
    ]);
    expect(result.lines.map((l) => l.ticker)).toEqual(["102110", "360750", "273130"]);
    expect(result.lines.map((l) => l.name)).toEqual([
      "TIGER 200",
      "TIGER 미국S&P500",
      "KODEX 종합채권(AA-이상)액티브",
    ]);
  });

  test("국내주식형과 해외주식형은 항상 3:7 비율을 유지한다", () => {
    const result = allocate({ riskLevel: 5, horizonYears: 1, monthlySurplus: 1_000_000 });
    // 주식 비중 60% -> 국내 18%, 해외 42%
    const [domestic, overseas] = result.lines;

    expect(domestic.percent).toBe(18);
    expect(overseas.percent).toBe(42);
  });

  test("비중의 합은 항상 100이다", () => {
    for (let riskLevel = 1 as const; riskLevel <= 5; riskLevel++) {
      for (const horizonYears of [1, 2, 3, 4, 5, 10, 20]) {
        const result = allocate({
          riskLevel: riskLevel as 1 | 2 | 3 | 4 | 5,
          horizonYears,
          monthlySurplus: 777_777,
        });
        expect(sumPercent(result.lines)).toBe(100);
      }
    }
  });

  test("원화 금액의 합은 항상 매달 남는 돈과 같다", () => {
    const result = allocate({ riskLevel: 4, horizonYears: 6, monthlySurplus: 1_234_567 });
    expect(sumAmount(result.lines)).toBe(1_234_567);
  });

  test("매달 남는 돈이 0원 이하이면 비중은 계산되지만 금액은 모두 0원이다", () => {
    const zero = allocate({ riskLevel: 3, horizonYears: 7, monthlySurplus: 0 });
    const negative = allocate({ riskLevel: 3, horizonYears: 7, monthlySurplus: -500_000 });

    expect(sumPercent(zero.lines)).toBe(100);
    expect(zero.lines.every((l) => l.amount === 0)).toBe(true);
    expect(sumPercent(negative.lines)).toBe(100);
    expect(negative.lines.every((l) => l.amount === 0)).toBe(true);
  });
});
