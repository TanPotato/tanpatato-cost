"use client";

import { CATEGORY_LABELS } from "@/features/etf-candidates";
import { formatHorizon, formatWon } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import type { Allocation, RiskLevel } from "../types";

export function RecommendationPanel({
  allocation,
  riskLevel,
  horizonYears,
  longestHorizon,
}: {
  allocation: Allocation;
  riskLevel: RiskLevel;
  horizonYears: number;
  longestHorizon: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>추천 포트폴리오</CardTitle>
          <CardDescription>
            투자 성향과 투자 가능 기간을 근거로 계산했습니다. 매달 남는 돈을 이
            비율대로 나눠 넣으면 됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-3">
            {allocation.lines.map((line) => (
              <li key={line.ticker} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm">
                    <span className="text-xs text-muted-foreground">
                      {CATEGORY_LABELS[line.category]}
                    </span>{" "}
                    <span className="font-medium">{line.name}</span>
                  </span>
                  <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
                    <b className="font-semibold text-foreground">{formatWon(line.amount)}</b> ·{" "}
                    {line.percent}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${line.percent}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {allocation.horizonCapApplied ? (
        <Card>
          <CardContent className="flex gap-3 py-4 text-sm leading-relaxed">
            <span aria-hidden className="w-1 shrink-0 rounded-full bg-destructive" />
            <span>
              투자 가능 기간이 짧아 성향이 만드는 기본 주식 비중{" "}
              <b>{allocation.baseStockPercent}%</b>를 <b>{allocation.finalStockPercent}%</b>로
              낮췄습니다. 돈이 필요한 시점에 하락장과 겹칠 위험을 줄이기 위해서입니다.
            </span>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>추천에 반영된 내 상황</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Fact label="투자 성향" value={`${riskLevel}단계`} />
          <Fact label="투자 가능 기간" value={formatHorizon(horizonYears, longestHorizon)} />
        </CardContent>
      </Card>

      <p className="text-xs leading-relaxed text-muted-foreground">
        실제 매수 절차 안내는 다음 단계입니다.
      </p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Badge className="font-normal" variant="outline">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </Badge>
  );
}
