import { describe, expect, test } from "vitest";

import { describeDependents, normalizeDependents } from "@/features/finance-record";
import type { DependentKey } from "@/features/finance-record";

describe("normalizeDependents", () => {
  test("자녀 인원은 하나만 남고 새로 고른 쪽이 앞선 것을 밀어낸다", () => {
    const previous: DependentKey[] = ["spouse", "child-1"];
    const next: DependentKey[] = ["spouse", "child-1", "child-3plus"];

    expect(normalizeDependents(previous, next)).toEqual(["spouse", "child-3plus"]);
  });

  test("자녀가 아닌 항목은 여럿 함께 설 수 있다", () => {
    expect(normalizeDependents([], ["parents", "spouse"])).toEqual([
      "spouse",
      "parents",
    ]);
  });

  test("고른 순서와 상관없이 선택지 순서로 정리한다", () => {
    expect(normalizeDependents([], ["parents", "child-2", "spouse"])).toEqual([
      "spouse",
      "child-2",
      "parents",
    ]);
  });

  test("자녀를 다시 눌러 해제하면 그대로 빠진다", () => {
    expect(normalizeDependents(["spouse", "child-2"], ["spouse"])).toEqual(["spouse"]);
  });
});

describe("describeDependents", () => {
  test("고른 것을 선택지 순서대로 이어 붙인다", () => {
    expect(describeDependents(["child-2", "spouse"])).toBe("배우자, 자녀 2명");
  });

  test("하나도 고르지 않으면 없음으로 읽힌다", () => {
    expect(describeDependents([])).toBe("없음");
  });
});
