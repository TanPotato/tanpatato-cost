import { formatWon } from "@/lib/format";
import { buildLinePoints } from "../chart-geometry";
import type { Snapshot } from "../types";

const WIDTH = 600;
const HEIGHT = 180;
const PADDING = 12;

function formatDate(date: string): string {
  const [, month, day] = date.split("-");
  return `${Number(month)}/${Number(day)}`;
}

/** 기록이 두 건 이상일 때 시간순 꺾은선으로 그린다. 외부 차트 라이브러리를 쓰지 않는다. */
export function TrendChart({ snapshots }: { snapshots: Snapshot[] }) {
  const points = buildLinePoints(snapshots, { width: WIDTH, height: HEIGHT, padding: PADDING });
  const path = points.map((p) => `${p.x},${p.y}`).join(" ");

  const first = snapshots[0];
  const last = snapshots[snapshots.length - 1];
  const lastPoint = points[points.length - 1];

  return (
    <div className="flex flex-col gap-2">
      <svg
        className="w-full text-primary"
        preserveAspectRatio="none"
        role="img"
        aria-label={`총자산 추이. 최근 값 ${formatWon(last.totalAssets)}`}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      >
        <polyline fill="none" points={path} stroke="currentColor" strokeWidth={2} />
        <polygon
          className="text-primary/10"
          fill="currentColor"
          points={`${PADDING},${HEIGHT - PADDING} ${path} ${WIDTH - PADDING},${HEIGHT - PADDING}`}
        />
        <circle cx={lastPoint.x} cy={lastPoint.y} r={4} fill="currentColor" />
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>
          {formatDate(first.date)} · {formatWon(first.totalAssets)}
        </span>
        <span>
          {formatDate(last.date)} · <b className="font-semibold text-foreground">{formatWon(last.totalAssets)}</b>
        </span>
      </div>
    </div>
  );
}
