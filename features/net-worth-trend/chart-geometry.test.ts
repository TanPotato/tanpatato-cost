import { describe, expect, test } from "vitest";

import { buildLinePoints } from "./chart-geometry";
import type { Snapshot } from "./types";

const SNAPSHOTS: Snapshot[] = [
  { date: "2026-09-01", totalAssets: 1_000_000 },
  { date: "2026-09-08", totalAssets: 1_500_000 },
  { date: "2026-09-15", totalAssets: 1_200_000 },
];

describe("buildLinePoints", () => {
  test("점 개수는 기록 개수와 같다", () => {
    const points = buildLinePoints(SNAPSHOTS, { width: 300, height: 100, padding: 10 });
    expect(points).toHaveLength(3);
  });

  test("가장 작은 값이 아래쪽(y가 큰 쪽), 가장 큰 값이 위쪽(y가 작은 쪽)이다", () => {
    const points = buildLinePoints(SNAPSHOTS, { width: 300, height: 100, padding: 10 });
    const maxIndex = 1; // 1,500,000
    const minIndex = 0; // 1,000,000

    expect(points[maxIndex].y).toBeLessThan(points[minIndex].y);
  });

  test("x는 시간 순서대로 왼쪽에서 오른쪽으로 늘어난다", () => {
    const points = buildLinePoints(SNAPSHOTS, { width: 300, height: 100, padding: 10 });
    expect(points[0].x).toBeLessThan(points[1].x);
    expect(points[1].x).toBeLessThan(points[2].x);
  });

  test("모든 값이 같으면(변화 없음) 예외 없이 가운데 높이로 그린다", () => {
    const flat: Snapshot[] = [
      { date: "2026-09-01", totalAssets: 1_000_000 },
      { date: "2026-09-08", totalAssets: 1_000_000 },
    ];
    const points = buildLinePoints(flat, { width: 300, height: 100, padding: 10 });
    expect(points[0].y).toBe(points[1].y);
    expect(Number.isFinite(points[0].y)).toBe(true);
  });

  test("점이 하나뿐이면 가운데 x에 하나만 그린다", () => {
    const points = buildLinePoints([SNAPSHOTS[0]], { width: 300, height: 100, padding: 10 });
    expect(points).toHaveLength(1);
    expect(Number.isFinite(points[0].x)).toBe(true);
    expect(Number.isFinite(points[0].y)).toBe(true);
  });
});
