import { ETF_CANDIDATES } from "@/features/etf-candidates";
import type { Category } from "@/features/etf-candidates";

import type { Allocation, AllocationInput, AllocationLine, RiskLevel } from "./types";

/** 투자 성향 1~5단계가 만드는 기본 주식 비중(%). 나머지는 채권이다. */
const BASE_STOCK_PERCENT: Record<RiskLevel, number> = {
  1: 20,
  2: 35,
  3: 50,
  4: 65,
  5: 80,
};

/** 주식 비중 안에서 국내주식형이 차지하는 몫. 나머지는 해외주식형이다. */
const DOMESTIC_SHARE_OF_STOCK = 0.3;

/**
 * 카테고리마다 정확히 하나씩 고정으로 추천하는 종목. 같은 지수를 추종하는
 * 후보 중 총보수가 더 낮은 쪽(국내주식형), 순자산이 더 큰 쪽(해외주식형),
 * 국채와 우량회사채를 함께 담는 액티브 상품(채권형)을 골랐다.
 * docs/specs/portfolio-recommendation/spec.md 참고.
 */
const RECOMMENDED_TICKER: Record<Category, string> = {
  "domestic-equity": "102110", // TIGER 200
  "overseas-equity": "360750", // TIGER 미국S&P500
  bond: "273130", // KODEX 종합채권(AA-이상)액티브
};

/** 투자 가능 기간이 짧을 때 거는 주식 비중 상한(%). 해당 없으면 상한이 없다. */
function stockPercentCap(horizonYears: number): number | null {
  if (horizonYears <= 2) return 60;
  if (horizonYears <= 4) return 70;
  return null;
}

function pickCandidate(category: Category) {
  const ticker = RECOMMENDED_TICKER[category];
  const candidate = ETF_CANDIDATES.find(
    (item) => item.category === category && item.ticker === ticker
  );
  if (!candidate) {
    throw new Error(`추천 후보를 찾을 수 없습니다: ${category}/${ticker}`);
  }
  return candidate;
}

/**
 * 반올림한 정수의 합을 목표값에 정확히 맞춘다. 각 값을 내림한 뒤,
 * 버려진 소수 부분이 큰 순서대로 하나씩 더해 차이를 메운다.
 */
function distributeToSum(rawValues: number[], targetSum: number): number[] {
  const floors = rawValues.map((value) => Math.floor(value));
  const remainder = targetSum - floors.reduce((total, value) => total + value, 0);

  const order = rawValues
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);

  const result = [...floors];
  for (let i = 0; i < remainder; i++) {
    result[order[i % order.length].index] += 1;
  }
  return result;
}

export function allocate(input: AllocationInput): Allocation {
  const baseStockPercent = BASE_STOCK_PERCENT[input.riskLevel];
  const cap = stockPercentCap(input.horizonYears);
  const finalStockPercent = cap === null ? baseStockPercent : Math.min(baseStockPercent, cap);
  const horizonCapApplied = finalStockPercent < baseStockPercent;
  const bondPercent = 100 - finalStockPercent;

  const [domesticPercent, overseasPercent, finalBondPercent] = distributeToSum(
    [
      finalStockPercent * DOMESTIC_SHARE_OF_STOCK,
      finalStockPercent * (1 - DOMESTIC_SHARE_OF_STOCK),
      bondPercent,
    ],
    100
  );

  const investable = Math.max(input.monthlySurplus, 0);
  const percents = [domesticPercent, overseasPercent, finalBondPercent];
  const amounts = distributeToSum(
    percents.map((percent) => (percent / 100) * investable),
    Math.round(investable)
  );

  const categories: Category[] = ["domestic-equity", "overseas-equity", "bond"];
  const lines: AllocationLine[] = categories.map((category, i) => {
    const candidate = pickCandidate(category);
    return {
      ticker: candidate.ticker,
      name: candidate.name,
      category,
      percent: percents[i],
      amount: amounts[i],
    };
  });

  return { lines, baseStockPercent, finalStockPercent, horizonCapApplied };
}
