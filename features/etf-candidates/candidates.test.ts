import { describe, expect, test } from "vitest";

import { CATEGORIES, ETF_CANDIDATES, candidatesByCategory } from "@/features/etf-candidates";

describe("ETF_CANDIDATES", () => {
  test("정확히 6개의 후보를 담는다", () => {
    expect(ETF_CANDIDATES).toHaveLength(6);
  });

  test("각 항목은 종목코드, 상품명, 카테고리, 추종 지수를 모두 채운다", () => {
    for (const candidate of ETF_CANDIDATES) {
      expect(candidate.ticker.trim()).not.toBe("");
      expect(candidate.name.trim()).not.toBe("");
      expect(candidate.index.trim()).not.toBe("");
      expect(CATEGORIES).toContain(candidate.category);
    }
  });

  test("카테고리는 국내주식형·해외주식형·채권형 세 가지로만 제한된다", () => {
    expect(CATEGORIES).toEqual(["domestic-equity", "overseas-equity", "bond"]);
  });

  test("각 카테고리에 정확히 2개씩 배정된다", () => {
    for (const category of CATEGORIES) {
      const count = ETF_CANDIDATES.filter((c) => c.category === category).length;
      expect(count).toBe(2);
    }
  });

  test("종목코드는 서로 겹치지 않는다", () => {
    const tickers = ETF_CANDIDATES.map((c) => c.ticker);
    expect(new Set(tickers).size).toBe(tickers.length);
  });

  test("확정된 6개 후보가 종목코드·상품명·카테고리·추종 지수 그대로 반영된다", () => {
    const byTicker = Object.fromEntries(ETF_CANDIDATES.map((c) => [c.ticker, c]));

    expect(byTicker["069500"]).toMatchObject({
      name: "KODEX 200",
      category: "domestic-equity",
      index: "코스피200",
    });
    expect(byTicker["102110"]).toMatchObject({
      name: "TIGER 200",
      category: "domestic-equity",
      index: "코스피200",
    });
    expect(byTicker["360750"]).toMatchObject({
      name: "TIGER 미국S&P500",
      category: "overseas-equity",
      index: "S&P500",
    });
    expect(byTicker["133690"]).toMatchObject({
      name: "TIGER 미국나스닥100",
      category: "overseas-equity",
      index: "나스닥100",
    });
    expect(byTicker["273130"]).toMatchObject({
      name: "KODEX 종합채권(AA-이상)액티브",
      category: "bond",
      index: "KAP 한국종합채권지수(AA- 이상)",
    });
    expect(byTicker["471230"]).toMatchObject({
      name: "KODEX 국고채10년액티브",
      category: "bond",
      index: "KAP 국고채10년지수",
    });
  });
});

describe("candidatesByCategory", () => {
  test("카테고리로 후보를 걸러 낸다", () => {
    const bonds = candidatesByCategory("bond");
    expect(bonds).toHaveLength(2);
    expect(bonds.every((c) => c.category === "bond")).toBe(true);
  });
});
