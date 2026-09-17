import { describe, expect, test } from "vitest";

import { monthlyAmount, summarize } from "@/features/finance-record";
import type { FinanceRecord, FlowEntry } from "@/features/finance-record";

import { emptyRecord } from "./seed";

function flow(partial: Partial<FlowEntry>): FlowEntry {
  return { id: "x", name: "항목", amount: 0, cycle: "month", ...partial };
}

function record(partial: Partial<FinanceRecord>): FinanceRecord {
  return { ...emptyRecord(), ...partial };
}

describe("monthlyAmount", () => {
  test("매달 항목은 입력값 그대로 쓴다", () => {
    expect(monthlyAmount(flow({ amount: 285_000, cycle: "month" }))).toBe(285_000);
  });

  test("분기, 반년, 1년 항목은 각각 3, 6, 12로 나눈다", () => {
    expect(monthlyAmount(flow({ amount: 300_000, cycle: "quarter" }))).toBe(100_000);
    expect(monthlyAmount(flow({ amount: 398_000, cycle: "half" }))).toBeCloseTo(66_333.33, 1);
    expect(monthlyAmount(flow({ amount: 1_180_000, cycle: "year" }))).toBeCloseTo(98_333.33, 1);
  });
});

describe("summarize", () => {
  test("월 환산한 수입에서 월 환산한 지출을 빼 매달 남는 돈을 낸다", () => {
    const summary = summarize(
      record({
        incomes: [flow({ id: "i1", amount: 4_850_000, cycle: "month" })],
        expenses: [
          flow({ id: "e1", amount: 780_000, cycle: "month" }),
          flow({ id: "e2", amount: 1_180_000, cycle: "year" }),
        ],
      })
    );

    expect(summary.monthlyIncome).toBe(4_850_000);
    expect(summary.monthlyExpense).toBeCloseTo(878_333.33, 1);
    expect(summary.monthlySurplus).toBeCloseTo(3_971_666.67, 1);
  });

  test("저축률은 매달 남는 돈을 월 수입으로 나눈 값이고, 수입이 없으면 낼 수 없다", () => {
    const withIncome = summarize(
      record({
        incomes: [flow({ id: "i1", amount: 1_000_000 })],
        expenses: [flow({ id: "e1", amount: 800_000 })],
      })
    );
    expect(withIncome.savingRate).toBeCloseTo(0.2, 5);

    expect(summarize(record({})).savingRate).toBeNull();
  });

  test("자산과 부채를 적으면 순자산이 나오고, 비워 두면 기록 전으로 남는다", () => {
    const recorded = summarize(
      record({
        assets: [{ id: "a1", name: "정기예금", amount: 42_000_000 }],
        debts: [{ id: "d1", name: "주택담보대출", amount: 185_000_000, rate: "3.82" }],
      })
    );
    expect(recorded.netWorth).toBe(-143_000_000);
    expect(recorded.hasBalanceRecord).toBe(true);

    expect(summarize(record({})).hasBalanceRecord).toBe(false);
  });

  test("수입과 지출이 모두 0이면 아직 진단할 것이 없는 상태다", () => {
    expect(summarize(record({})).isBlank).toBe(true);
    expect(
      summarize(record({ incomes: [flow({ id: "i1", amount: 1 })] })).isBlank
    ).toBe(false);
  });
});
