import { describe, expect, test } from "vitest";

import { diagnose, summarize } from "@/features/finance-record";
import type { FinanceRecord, FlowEntry } from "@/features/finance-record";

import { emptyRecord } from "./seed";

function flow(partial: Partial<FlowEntry>): FlowEntry {
  return { id: "x", name: "항목", amount: 0, cycle: "month", ...partial };
}

function record(partial: Partial<FinanceRecord>): FinanceRecord {
  const base = emptyRecord();
  return { ...base, ...partial, profile: { ...base.profile, ...partial.profile } };
}

function run(partial: Partial<FinanceRecord>) {
  const current = record(partial);
  return diagnose(current, summarize(current));
}

const earning = [flow({ id: "i1", amount: 5_000_000, cycle: "month" as const })];

describe("지출 순위", () => {
  test("월 환산 금액이 큰 항목부터 정렬하고 비중을 함께 낸다", () => {
    const { rankedExpenses } = run({
      incomes: earning,
      expenses: [
        flow({ id: "e1", name: "자동차 보험료", amount: 1_200_000, cycle: "year" }),
        flow({ id: "e2", name: "식비·생활비", amount: 1_400_000, cycle: "month" }),
        flow({ id: "e3", name: "아파트 관리비", amount: 300_000, cycle: "month" }),
      ],
    });

    expect(rankedExpenses.map((item) => item.name)).toEqual([
      "식비·생활비",
      "아파트 관리비",
      "자동차 보험료",
    ]);
    expect(rankedExpenses[0].share).toBeCloseTo(1_400_000 / 1_800_000, 5);
  });

  test("금액이 0인 항목은 순위에서 빠진다", () => {
    const { rankedExpenses } = run({
      incomes: earning,
      expenses: [flow({ id: "e1", amount: 0 }), flow({ id: "e2", amount: 100 })],
    });

    expect(rankedExpenses).toHaveLength(1);
  });
});

describe("눈여겨볼 것", () => {
  test("매달 남으면 저축률을, 모자라면 경고를 낸다", () => {
    const surplus = run({ incomes: earning, expenses: [flow({ id: "e1", amount: 1_000_000 })] });
    expect(surplus.notes.map((note) => note.kind)).toContain("surplus");

    const deficit = run({ incomes: earning, expenses: [flow({ id: "e1", amount: 9_000_000 })] });
    const alert = deficit.notes.find((note) => note.kind === "deficit");
    expect(alert?.tone).toBe("warn");
  });

  test("매달이 아닌 주기로 적힌 항목의 건수와 월 환산 합계를 알린다", () => {
    const { notes } = run({
      incomes: earning,
      expenses: [
        flow({ id: "e1", amount: 1_200_000, cycle: "year" }),
        flow({ id: "e2", amount: 600_000, cycle: "half" }),
        flow({ id: "e3", amount: 300_000, cycle: "month" }),
      ],
    });

    const note = notes.find((item) => item.kind === "irregular");
    expect(note?.text).toContain("2건");
    expect(note?.text).toContain("200,000원");
  });

  test("투자 가능 기간 안에 있는 목돈 지출만 짚고, 조사는 받침에 맞춘다", () => {
    const inside = run({
      incomes: earning,
      profile: {
        ...emptyRecord().profile,
        horizonYears: 7,
        goals: [
          { id: "g1", name: "자녀 대학 등록금", amount: 40_000_000, yearsAway: "3" },
          { id: "g2", name: "차량 교체", amount: 30_000_000, yearsAway: "5" },
          { id: "g3", name: "은퇴 이주", amount: 50_000_000, yearsAway: "12" },
        ],
      },
    });

    const goalNotes = inside.notes.filter((note) => note.kind === "goal");
    expect(goalNotes).toHaveLength(2);
    expect(goalNotes[0].text).toContain("등록금으로");
    expect(goalNotes[1].text).toContain("차량 교체로");
  });

  test("금리가 5% 이상인 대출을 짚는다", () => {
    const { notes } = run({
      incomes: earning,
      debts: [
        { id: "d1", name: "마이너스 통장", amount: 22_000_000, rate: "5.4" },
        { id: "d2", name: "주택담보대출", amount: 185_000_000, rate: "3.82" },
      ],
    });

    const highRate = notes.filter((note) => note.kind === "high-rate-debt");
    expect(highRate).toHaveLength(1);
    expect(highRate[0].text).toContain("마이너스 통장");
  });

  test("자산과 부채를 적지 않았으면 적으라고 안내한다", () => {
    const missing = run({ incomes: earning });
    expect(missing.notes.map((note) => note.kind)).toContain("balance-missing");

    const recorded = run({
      incomes: earning,
      assets: [{ id: "a1", name: "정기예금", amount: 1_000 }],
    });
    expect(recorded.notes.map((note) => note.kind)).not.toContain("balance-missing");
  });
});
