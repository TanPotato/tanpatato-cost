import { describe, expect, test } from "vitest";

import { compareAllocations } from "./compare";
import type { HoldingAmount, RecommendedShare } from "./types";

// 추천: 국내 15% / 해외 35% / 채권 50% (portfolio-recommendation 성향 3단계·7년 기준과 같은 모양)
const RECOMMENDED: RecommendedShare[] = [
  { category: "domestic-equity", percent: 15 },
  { category: "overseas-equity", percent: 35 },
  { category: "bond", percent: 50 },
];

function find(result: ReturnType<typeof compareAllocations>, category: string) {
  const line = result.categories.find((c) => c.category === category);
  if (!line) throw new Error(`${category} not found`);
  return line;
}

describe("compareAllocations", () => {
  test("보유 평가금액이 하나도 없으면 hasEnoughData가 false다", () => {
    const result = compareAllocations([], RECOMMENDED);
    expect(result.hasEnoughData).toBe(false);
    expect(result.totalMarketValue).toBe(0);
  });

  test("6개 후보 티커는 각자 카테고리로, 후보 밖 티커는 기타로 묶인다", () => {
    const holdings: HoldingAmount[] = [
      { ticker: "102110", marketValue: 300_000 }, // TIGER 200 → domestic-equity
      { ticker: "360750", marketValue: 300_000 }, // TIGER 미국S&P500 → overseas-equity
      { ticker: "273130", marketValue: 300_000 }, // KODEX 종합채권 → bond
      { ticker: "005930", marketValue: 100_000 }, // 삼성전자 → 기타
    ];

    const result = compareAllocations(holdings, RECOMMENDED);

    expect(result.totalMarketValue).toBe(1_000_000);
    expect(find(result, "domestic-equity").holdingAmount).toBe(300_000);
    expect(find(result, "overseas-equity").holdingAmount).toBe(300_000);
    expect(find(result, "bond").holdingAmount).toBe(300_000);
    expect(find(result, "other").holdingAmount).toBe(100_000);
    // 기타를 포함한 전체가 분모라 각각 30%, 기타는 10%다.
    expect(find(result, "domestic-equity").holdingPercent).toBeCloseTo(30);
    expect(find(result, "other").holdingPercent).toBeCloseTo(10);
  });

  test("기타는 목표 비중·차이·조정금액이 모두 null이고 재조정 대상이 아니다", () => {
    const holdings: HoldingAmount[] = [{ ticker: "005930", marketValue: 500_000 }];
    const result = compareAllocations(holdings, RECOMMENDED);

    const other = find(result, "other");
    expect(other.recommendedPercent).toBeNull();
    expect(other.driftPercentPoints).toBeNull();
    expect(other.adjustmentAmount).toBeNull();
    expect(other.needsRebalance).toBe(false);
  });

  test("차이가 10%p 미만이면 재조정 대상이 아니다", () => {
    // 국내 15% 추천, 실제 20% 보유 → 5%p 차이.
    const holdings: HoldingAmount[] = [
      { ticker: "102110", marketValue: 200_000 }, // 20%
      { ticker: "360750", marketValue: 350_000 }, // 35%
      { ticker: "273130", marketValue: 450_000 }, // 45%
    ];
    const result = compareAllocations(holdings, RECOMMENDED);

    expect(find(result, "domestic-equity").driftPercentPoints).toBeCloseTo(5);
    expect(find(result, "domestic-equity").needsRebalance).toBe(false);
    expect(result.anyNeedsRebalance).toBe(false);
  });

  test("차이가 10%p 이상이면 재조정 대상이고, 목표에 맞추는 조정 금액이 나온다", () => {
    // 국내 15% 추천, 실제 30% 보유 → 15%p 초과.
    const holdings: HoldingAmount[] = [
      { ticker: "102110", marketValue: 300_000 }, // 30%
      { ticker: "360750", marketValue: 350_000 }, // 35%
      { ticker: "273130", marketValue: 350_000 }, // 35%
    ];
    const result = compareAllocations(holdings, RECOMMENDED);
    const domestic = find(result, "domestic-equity");

    expect(domestic.driftPercentPoints).toBeCloseTo(15);
    expect(domestic.needsRebalance).toBe(true);
    expect(result.anyNeedsRebalance).toBe(true);
    // 목표 금액 15% × 1,000,000 = 150,000. 실제 300,000이니 150,000 초과 보유.
    expect(domestic.adjustmentAmount).toBe(-150_000);
  });

  test("부족한 카테고리는 조정 금액이 양수(더 사야 할 금액)다", () => {
    // 채권 50% 추천, 실제 20% 보유 → 30%p 부족.
    const holdings: HoldingAmount[] = [
      { ticker: "102110", marketValue: 400_000 },
      { ticker: "360750", marketValue: 400_000 },
      { ticker: "273130", marketValue: 200_000 },
    ];
    const result = compareAllocations(holdings, RECOMMENDED);
    const bond = find(result, "bond");

    expect(bond.driftPercentPoints).toBeCloseTo(-30);
    expect(bond.needsRebalance).toBe(true);
    // 목표 금액 50% × 1,000,000 = 500,000. 실제 200,000이니 300,000 부족.
    expect(bond.adjustmentAmount).toBe(300_000);
  });
});
