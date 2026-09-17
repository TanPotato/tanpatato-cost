import { describe, expect, test } from "vitest";

import { buildSteps } from "./steps";
import type { PurchaseTarget } from "./types";

const NORMAL_TARGETS: PurchaseTarget[] = [
  { category: "domestic-equity", name: "TIGER 200", amount: 570_000 },
  { category: "overseas-equity", name: "TIGER 미국S&P500", amount: 1_330_000 },
  { category: "bond", name: "KODEX 종합채권(AA-이상)액티브", amount: 1_900_000 },
];

const ZERO_TARGETS: PurchaseTarget[] = [
  { category: "domestic-equity", name: "TIGER 200", amount: 0 },
  { category: "overseas-equity", name: "TIGER 미국S&P500", amount: 0 },
  { category: "bond", name: "KODEX 종합채권(AA-이상)액티브", amount: 0 },
];

describe("buildSteps", () => {
  test("정확히 6단계를 순서대로 낸다: 준비 3개, 매수 3개", () => {
    const steps = buildSteps(NORMAL_TARGETS);

    expect(steps.map((step) => step.id)).toEqual([
      "install-app",
      "open-account",
      "transfer-funds",
      "buy-domestic-equity",
      "buy-overseas-equity",
      "buy-bond",
    ]);
  });

  test("매수 세 단계는 체크 가능하고 그 시점의 금액을 담는다", () => {
    const steps = buildSteps(NORMAL_TARGETS);
    const buySteps = steps.filter((step) => step.id.startsWith("buy-"));

    expect(buySteps.every((step) => step.checkable)).toBe(true);
    expect(buySteps.map((step) => step.amount)).toEqual([570_000, 1_330_000, 1_900_000]);
    expect(steps.find((step) => step.id === "buy-domestic-equity")?.title).toContain("TIGER 200");
  });

  test("준비 세 단계는 금액과 무관하게 항상 체크 가능하다", () => {
    const steps = buildSteps(NORMAL_TARGETS);
    const prepSteps = steps.filter((step) => !step.id.startsWith("buy-"));

    expect(prepSteps.every((step) => step.checkable)).toBe(true);
  });

  test("세 종목 금액이 모두 0원이면 매수 세 단계는 체크 불가능한 안내로 바뀐다", () => {
    const steps = buildSteps(ZERO_TARGETS);
    const buySteps = steps.filter((step) => step.id.startsWith("buy-"));
    const prepSteps = steps.filter((step) => !step.id.startsWith("buy-"));

    expect(buySteps.every((step) => !step.checkable)).toBe(true);
    expect(buySteps.every((step) => step.amount === 0)).toBe(true);
    expect(buySteps[0].description).toMatch(/지출을 손봐|매달 남는 돈/);
    expect(prepSteps.every((step) => step.checkable)).toBe(true);
  });

  test("종목 중 일부만 0원이어도 전체가 0원이 아니면 매수 단계는 그대로 체크 가능하다", () => {
    const mixed: PurchaseTarget[] = [
      { category: "domestic-equity", name: "TIGER 200", amount: 0 },
      { category: "overseas-equity", name: "TIGER 미국S&P500", amount: 500_000 },
      { category: "bond", name: "KODEX 종합채권(AA-이상)액티브", amount: 500_000 },
    ];
    const steps = buildSteps(mixed);
    const buySteps = steps.filter((step) => step.id.startsWith("buy-"));

    expect(buySteps.every((step) => step.checkable)).toBe(true);
  });
});
