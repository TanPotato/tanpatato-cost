import { CATEGORIES, CATEGORY_LABELS, ETF_CANDIDATES } from "@/features/etf-candidates";
import type { Category } from "@/features/etf-candidates";

import { OTHER } from "./types";
import type {
  CategoryComparison,
  CategoryOrOther,
  HoldingAmount,
  RebalanceComparison,
  RecommendedShare,
} from "./types";

/** 보유 비중이 추천 비중과 이 값(퍼센트포인트) 이상 벌어지면 재조정을 고려해 보라고 알린다. */
const REBALANCE_THRESHOLD_POINTS = 10;

const CATEGORY_BY_TICKER: Record<string, Category> = Object.fromEntries(
  ETF_CANDIDATES.map((candidate) => [candidate.ticker, candidate.category])
);

/** 6개 후보와 일치하면 그 카테고리로, 아니면 기타로 묶는다. */
function categorize(ticker: string): CategoryOrOther {
  return CATEGORY_BY_TICKER[ticker] ?? OTHER;
}

/**
 * 보유 종목을 카테고리별로 묶어 추천 목표 비중과 비교한다. 비교는 비중(%)만
 * 쓴다 — 추천의 원화 금액은 그 달 매달 남는 돈 하나에 곱한 값이라 여러 달에
 * 걸쳐 쌓인 보유 평가금액과 규모가 달라 비교 자체가 성립하지 않는다.
 */
export function compareAllocations(
  holdings: HoldingAmount[],
  recommended: RecommendedShare[]
): RebalanceComparison {
  const totalMarketValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  const hasEnoughData = totalMarketValue > 0;

  const amountByBucket: Record<CategoryOrOther, number> = {
    "domestic-equity": 0,
    "overseas-equity": 0,
    bond: 0,
    [OTHER]: 0,
  };
  for (const holding of holdings) {
    amountByBucket[categorize(holding.ticker)] += holding.marketValue;
  }

  const recommendedPercentByCategory: Partial<Record<Category, number>> = Object.fromEntries(
    recommended.map((line) => [line.category, line.percent])
  );

  function holdingPercent(amount: number): number {
    return hasEnoughData ? (amount / totalMarketValue) * 100 : 0;
  }

  const categoryLines: CategoryComparison[] = CATEGORIES.map((category) => {
    const holdingAmount = amountByBucket[category];
    const percent = holdingPercent(holdingAmount);
    const recommendedPercent = recommendedPercentByCategory[category] ?? 0;
    const drift = percent - recommendedPercent;
    const needsRebalance = hasEnoughData && Math.abs(drift) >= REBALANCE_THRESHOLD_POINTS;
    const targetAmount = (recommendedPercent / 100) * totalMarketValue;

    return {
      category,
      label: CATEGORY_LABELS[category],
      holdingAmount,
      holdingPercent: percent,
      recommendedPercent,
      driftPercentPoints: drift,
      needsRebalance,
      adjustmentAmount: Math.round(targetAmount - holdingAmount),
    };
  });

  const otherLine: CategoryComparison = {
    category: OTHER,
    label: "기타",
    holdingAmount: amountByBucket[OTHER],
    holdingPercent: holdingPercent(amountByBucket[OTHER]),
    recommendedPercent: null,
    driftPercentPoints: null,
    needsRebalance: false,
    adjustmentAmount: null,
  };

  const categories = [...categoryLines, otherLine];

  return {
    totalMarketValue,
    categories,
    hasEnoughData,
    anyNeedsRebalance: categories.some((line) => line.needsRebalance),
  };
}
