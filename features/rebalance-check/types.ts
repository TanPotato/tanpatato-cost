import type { Category } from "@/features/etf-candidates";

/** 6개 후보 밖의 보유 종목이 묶이는 갈래. 목표 비중이 없다. */
export const OTHER = "other" as const;
export type CategoryOrOther = Category | typeof OTHER;

/**
 * 비교에 넣을 보유 종목 한 줄. holdings-tracking의 Holding을 그대로 받지
 * 않고 이 모양으로 옮겨 담아 받는다 — execution-guide의 PurchaseTarget과
 * 같은 구조다. 이 모듈은 holdings-tracking을 몰라야 한다.
 */
export type HoldingAmount = {
  ticker: string;
  /** 그 종목의 평가금액(수량×전일 종가). 아직 종가를 못 받았으면 0. */
  marketValue: number;
};

/**
 * 비교에 쓸 추천 목표 비중 한 줄. portfolio-recommendation의 AllocationLine을
 * 그대로 받지 않고 필요한 값만 옮겨 담아 받는다. 이 모듈은
 * portfolio-recommendation을 몰라야 한다.
 */
export type RecommendedShare = {
  category: Category;
  /** 0~100 정수. 국내주식형·해외주식형·채권형 세 줄의 합이 100이다. */
  percent: number;
};

export type CategoryComparison = {
  category: CategoryOrOther;
  label: string;
  /** 그 카테고리로 묶인 보유 종목의 평가금액 합. */
  holdingAmount: number;
  /** 전체 보유 평가금액(기타 포함) 대비 비중(0~100). 분모가 0이면 0. */
  holdingPercent: number;
  /** 기타는 목표 비중이 없어 null. */
  recommendedPercent: number | null;
  /** holdingPercent - recommendedPercent. 기타는 null. */
  driftPercentPoints: number | null;
  /** |driftPercentPoints|가 임계값 이상인지. 기타는 항상 false. */
  needsRebalance: boolean;
  /**
   * 전체 평가금액에 추천 비중을 곱한 목표 금액에서 실제 평가금액을 뺀 값.
   * 양수면 더 사야 목표에 맞고, 음수면 이미 목표보다 많다. 기타는 null.
   */
  adjustmentAmount: number | null;
};

export type RebalanceComparison = {
  totalMarketValue: number;
  /** 국내주식형·해외주식형·채권형·기타 순서로 항상 4줄이다. */
  categories: CategoryComparison[];
  /** totalMarketValue가 0보다 큰지. false면 비교 자체가 의미 없다. */
  hasEnoughData: boolean;
  anyNeedsRebalance: boolean;
};
