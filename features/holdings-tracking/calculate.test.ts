import { describe, expect, test } from "vitest";

import { purchaseAmount, marketValue, profit, returnRate, summarize } from "./calculate";
import type { Holding } from "./types";

function holding(overrides: Partial<Holding> = {}): Holding {
  return {
    id: "h-1",
    ticker: "102110",
    name: "TIGER 200",
    quantity: 10,
    avgBuyPrice: 50_000,
    lastPrice: 55_000,
    lastPriceAt: "2026-09-17T00:00:00.000Z",
    ...overrides,
  };
}

describe("purchaseAmount", () => {
  test("수량 곱하기 매수단가", () => {
    expect(purchaseAmount(holding({ quantity: 10, avgBuyPrice: 50_000 }))).toBe(500_000);
  });
});

describe("marketValue", () => {
  test("수량 곱하기 전일 종가", () => {
    expect(marketValue(holding({ quantity: 10, lastPrice: 55_000 }))).toBe(550_000);
  });

  test("아직 조회하지 못했으면(lastPrice가 null) 0이다", () => {
    expect(marketValue(holding({ quantity: 10, lastPrice: null }))).toBe(0);
  });
});

describe("profit", () => {
  test("평가금액에서 매입금액을 뺀 값", () => {
    expect(profit(holding({ quantity: 10, avgBuyPrice: 50_000, lastPrice: 55_000 }))).toBe(
      50_000
    );
  });

  test("종가가 매수단가보다 낮으면 음수(손실)다", () => {
    expect(profit(holding({ quantity: 10, avgBuyPrice: 50_000, lastPrice: 45_000 }))).toBe(
      -50_000
    );
  });
});

describe("returnRate", () => {
  test("평가손익을 매입금액으로 나눈 비율", () => {
    expect(returnRate(holding({ quantity: 10, avgBuyPrice: 50_000, lastPrice: 55_000 }))).toBe(
      0.1
    );
  });

  test("매입금액이 0이면 null이다(0으로 나누지 않는다)", () => {
    expect(returnRate(holding({ quantity: 10, avgBuyPrice: 0, lastPrice: 55_000 }))).toBeNull();
  });
});

describe("summarize", () => {
  test("여러 종목의 매입금액·평가금액·평가손익 합과 전체 수익률을 낸다", () => {
    const holdings = [
      holding({ id: "h-1", quantity: 10, avgBuyPrice: 50_000, lastPrice: 55_000 }),
      holding({ id: "h-2", quantity: 5, avgBuyPrice: 20_000, lastPrice: 18_000 }),
    ];

    const totals = summarize(holdings);

    expect(totals.totalPurchaseAmount).toBe(600_000); // 500,000 + 100,000
    expect(totals.totalMarketValue).toBe(640_000); // 550,000 + 90,000
    expect(totals.totalProfit).toBe(40_000);
    expect(totals.totalReturnRate).toBeCloseTo(40_000 / 600_000);
  });

  test("종목이 하나도 없으면 모두 0이고 수익률은 null이다", () => {
    const totals = summarize([]);

    expect(totals).toEqual({
      totalPurchaseAmount: 0,
      totalMarketValue: 0,
      totalProfit: 0,
      totalReturnRate: null,
    });
  });
});
