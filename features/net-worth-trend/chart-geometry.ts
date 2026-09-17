import type { Snapshot } from "./types";

export type ChartPoint = { x: number; y: number };

export type ChartBox = { width: number; height: number; padding: number };

/**
 * 기록을 SVG 좌표로 옮긴다. x는 시간 순서(왼쪽이 과거), y는 값이 클수록
 * 위쪽(작은 y)이다. 값이 전부 같으면(변화 없음) 0으로 나누지 않고 가운데
 * 높이로 그린다.
 */
export function buildLinePoints(snapshots: Snapshot[], box: ChartBox): ChartPoint[] {
  const { width, height, padding } = box;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const values = snapshots.map((s) => s.totalAssets);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  return snapshots.map((snapshot, index) => {
    const x =
      snapshots.length === 1 ? width / 2 : padding + (index / (snapshots.length - 1)) * innerWidth;
    const y = range === 0 ? height / 2 : padding + (1 - (snapshot.totalAssets - min) / range) * innerHeight;
    return { x, y };
  });
}
