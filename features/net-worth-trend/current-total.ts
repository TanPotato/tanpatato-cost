import { loadHoldings, summarize as summarizeHoldings } from "@/features/holdings-tracking";

/**
 * 총자산(GLOSSARY.md 참고)을 낸다. 순자산에 그 시점 보유 종목 평가금액 합을
 * 더한다. finance-record는 이 모듈을 모르므로, 순자산은 값 하나로만
 * 옮겨 받는다 — holdings-tracking의 저장값은 여기서 직접 읽는다.
 */
export function currentTotalAssets(netWorth: number): number {
  const holdings = loadHoldings();
  return netWorth + summarizeHoldings(holdings).totalMarketValue;
}
