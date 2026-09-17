import type { Category } from "@/features/etf-candidates";

/**
 * 이 모듈은 finance-record의 RiskLevel과 같은 모양이지만 따로 정의한다.
 * portfolio-recommendation은 finance-record를 몰라야 한다. 호출하는 쪽이
 * record-and-diagnose의 값을 이 셋으로 옮겨 담아 건넨다.
 */
export type RiskLevel = 1 | 2 | 3 | 4 | 5;

export type AllocationInput = {
  riskLevel: RiskLevel;
  /** 투자금을 묶어 둘 수 있는 햇수. */
  horizonYears: number;
  /** 매달 남는 돈. 0 이하면 비중만 계산하고 금액은 모두 0으로 낸다. */
  monthlySurplus: number;
};

export type AllocationLine = {
  ticker: string;
  name: string;
  category: Category;
  /** 0~100 정수. 세 줄의 합은 항상 100이다. */
  percent: number;
  /** percent에 매달 남는 돈을 곱한 원화 금액. 세 줄의 합은 항상 투자 가능 금액과 같다. */
  amount: number;
};

export type Allocation = {
  /** 국내주식형, 해외주식형, 채권형 순서로 항상 3줄이다. */
  lines: AllocationLine[];
  /** 투자 성향이 만든 기본 주식 비중(%). 상한 적용 여부와 무관하게 항상 채운다. */
  baseStockPercent: number;
  /** 기간 상한까지 반영한 최종 주식 비중(%; 국내+해외 합). */
  finalStockPercent: number;
  /** 기간 상한 때문에 baseStockPercent보다 실제로 낮아졌는지. */
  horizonCapApplied: boolean;
};
