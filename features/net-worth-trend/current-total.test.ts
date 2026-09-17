import { beforeEach, describe, expect, test } from "vitest";

import { currentTotalAssets } from "./current-total";
import { saveHoldings } from "@/features/holdings-tracking";

beforeEach(() => {
  window.localStorage.clear();
});

describe("currentTotalAssets", () => {
  test("보유 종목이 없으면 순자산 그대로다", () => {
    expect(currentTotalAssets(1_000_000)).toBe(1_000_000);
  });

  test("보유 종목 평가금액을 순자산에 더한다", () => {
    saveHoldings([
      {
        id: "h-1",
        ticker: "102110",
        name: "TIGER 200",
        quantity: 10,
        avgBuyPrice: 50_000,
        lastPrice: 55_000,
        lastPriceAt: "2026-09-17T00:00:00.000Z",
      },
    ]);

    expect(currentTotalAssets(1_000_000)).toBe(1_000_000 + 550_000);
  });
});
