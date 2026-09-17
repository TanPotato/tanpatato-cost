import { describe, expect, test } from "vitest";

import { recordSnapshot, todayKey } from "./record";
import type { Snapshot } from "./types";

describe("recordSnapshot", () => {
  test("기록이 없으면 새 기록 하나를 만든다", () => {
    const result = recordSnapshot([], "2026-09-17", 1_000_000);
    expect(result).toEqual([{ date: "2026-09-17", totalAssets: 1_000_000 }]);
  });

  test("같은 날짜가 있으면 새 값으로 덮어쓰고 건수가 늘지 않는다", () => {
    const existing: Snapshot[] = [{ date: "2026-09-17", totalAssets: 1_000_000 }];
    const result = recordSnapshot(existing, "2026-09-17", 1_200_000);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ date: "2026-09-17", totalAssets: 1_200_000 });
  });

  test("다른 날짜면 새 기록을 더하고 날짜순으로 정렬한다", () => {
    const existing: Snapshot[] = [{ date: "2026-09-15", totalAssets: 900_000 }];
    const result = recordSnapshot(existing, "2026-09-17", 1_000_000);

    expect(result).toEqual([
      { date: "2026-09-15", totalAssets: 900_000 },
      { date: "2026-09-17", totalAssets: 1_000_000 },
    ]);
  });

  test("날짜 순서가 뒤섞여 들어와도 오름차순으로 정렬된다", () => {
    const existing: Snapshot[] = [
      { date: "2026-09-17", totalAssets: 1_000_000 },
      { date: "2026-09-10", totalAssets: 800_000 },
    ];
    const result = recordSnapshot(existing, "2026-09-14", 900_000);

    expect(result.map((s) => s.date)).toEqual(["2026-09-10", "2026-09-14", "2026-09-17"]);
  });
});

describe("todayKey", () => {
  test("로컬 날짜를 YYYY-MM-DD로 낸다", () => {
    const date = new Date(2026, 8, 7); // 2026-09-07 (월은 0부터 시작)
    expect(todayKey(date)).toBe("2026-09-07");
  });

  test("한 자리 월·일도 두 자리로 채운다", () => {
    const date = new Date(2026, 0, 5); // 2026-01-05
    expect(todayKey(date)).toBe("2026-01-05");
  });
});
