"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { formatWon } from "@/lib/format";
import { compareAllocations } from "../compare";
import { OTHER } from "../types";
import type { HoldingAmount, RecommendedShare } from "../types";

function formatPoints(points: number): string {
  return `${points >= 0 ? "+" : ""}${points.toFixed(1)}%p`;
}

export function RebalanceCard({
  holdings,
  recommended,
}: {
  holdings: HoldingAmount[];
  recommended: RecommendedShare[];
}) {
  const result = compareAllocations(holdings, recommended);

  return (
    <Card>
      <CardHeader>
        <CardTitle>보유 비중과 추천 비중 비교</CardTitle>
        <CardDescription>
          보유 종목을 카테고리로 묶어 추천 탭의 목표 비중과 나란히 보여줍니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!result.hasEnoughData ? (
          <p className="text-sm text-muted-foreground">
            아직 비교할 보유 금액이 없습니다. 종목을 추가하고 종가를 조회하면 여기에 나타납니다.
          </p>
        ) : (
          <>
            {result.anyNeedsRebalance ? (
              <div className="flex gap-3 rounded-lg border p-3 text-sm leading-relaxed">
                <span aria-hidden className="w-1 shrink-0 rounded-full bg-destructive" />
                <span>
                  일부 카테고리가 추천 비중과 10%p 이상 벌어졌습니다. 재조정을 고려해 보세요.
                </span>
              </div>
            ) : null}

            <ul className="flex flex-col gap-3">
              {result.categories.map((line) => (
                <li key={line.category} className="flex flex-col gap-1.5 rounded-lg border p-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium">{line.label}</span>
                    <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
                      보유 <b className="font-semibold text-foreground">
                        {line.holdingPercent.toFixed(1)}%
                      </b>
                      {line.category !== OTHER ? (
                        <>
                          {" "}
                          · 추천 <b className="font-semibold text-foreground">
                            {line.recommendedPercent}%
                          </b>
                        </>
                      ) : null}
                    </span>
                  </div>

                  {line.category === OTHER ? (
                    <p className="text-xs text-muted-foreground">
                      후보 ETF 밖의 종목입니다. 목표 비중이 없어 재조정 판단에는 넣지 않습니다.
                    </p>
                  ) : (
                    <p
                      className={cn(
                        "text-xs",
                        line.needsRebalance ? "text-destructive" : "text-muted-foreground"
                      )}
                    >
                      차이 {formatPoints(line.driftPercentPoints ?? 0)}
                      {line.needsRebalance && line.adjustmentAmount !== null ? (
                        <>
                          {" "}
                          ·{" "}
                          {line.adjustmentAmount > 0
                            ? `추천 비중에 맞추려면 약 ${formatWon(line.adjustmentAmount)}어치 더 필요합니다.`
                            : `추천 비중보다 약 ${formatWon(Math.abs(line.adjustmentAmount))}어치 많습니다.`}
                        </>
                      ) : null}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
