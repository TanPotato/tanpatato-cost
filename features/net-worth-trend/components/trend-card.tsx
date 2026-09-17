"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { formatPercent, formatWon } from "@/lib/format";
import { loadHoldings } from "@/features/holdings-tracking";
import { currentTotalAssets } from "../current-total";
import { calculateGoalProgress } from "../goal";
import { recordSnapshot, todayKey } from "../record";
import { loadSnapshots, saveSnapshots } from "../storage";
import type { Snapshot } from "../types";
import { TrendChart } from "./trend-chart";

export function TrendCard({
  netWorth,
  hasBalanceRecord,
  monthlySurplus,
  yearsToRetirement,
  retirementGoalAmount,
}: {
  netWorth: number;
  hasBalanceRecord: boolean;
  monthlySurplus: number;
  /** 은퇴까지 남은 기간(년). 적지 않았으면 null. */
  yearsToRetirement: number | null;
  /** 은퇴 목표 총자산. 0이면 미설정이다. */
  retirementGoalAmount: number;
}) {
  // 진단 화면을 "열 때"만 기록한다. 이 카드는 진단 탭을 벗어나면 통째로
  // 사라졌다가 돌아올 때 다시 그려지므로, 마운트(=지연 초기화 한 번 실행)가
  // "열 때" 한 번과 같다.
  const [snapshots] = useState<Snapshot[]>(() => {
    const loaded = loadSnapshots();
    const hasAnyData = hasBalanceRecord || loadHoldings().length > 0;
    if (!hasAnyData) return loaded;

    const total = currentTotalAssets(netWorth);
    return recordSnapshot(loaded, todayKey(), total);
  });

  useEffect(() => {
    saveSnapshots(snapshots);
  }, [snapshots]);

  const currentTotal = currentTotalAssets(netWorth);
  const goal = calculateGoalProgress({
    currentTotal,
    goalAmount: retirementGoalAmount,
    monthlySurplus,
    yearsToRetirement,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>총자산 추이</CardTitle>
        <CardDescription>
          진단 화면을 열 때마다 그 시점 총자산(순자산 + 보유 종목 평가금액)을 기록합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {snapshots.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            자산·부채나 보유 종목을 적으면 총자산 추이가 기록됩니다.
          </p>
        ) : snapshots.length === 1 ? (
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">지금 총자산</p>
            <p className="text-2xl font-bold tabular-nums">
              {formatWon(snapshots[0].totalAssets)}
            </p>
            <p className="text-xs text-muted-foreground">기록이 쌓이면 그래프로 보여드립니다.</p>
          </div>
        ) : (
          <TrendChart snapshots={snapshots} />
        )}

        <GoalProgress goal={goal} />
      </CardContent>
    </Card>
  );
}

function GoalProgress({ goal }: { goal: ReturnType<typeof calculateGoalProgress> }) {
  if (!goal.hasGoal) {
    return (
      <p className="rounded-lg border p-3 text-sm text-muted-foreground">
        내 상황 탭에서 은퇴 목표 총자산을 적으면 진행률을 보여드립니다.
      </p>
    );
  }

  const ratio = goal.progressRatio ?? 0;

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">은퇴 목표 달성률</span>
        <span className="text-sm font-semibold tabular-nums">{formatPercent(ratio)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(100, ratio * 100)}%` }}
        />
      </div>

      {!goal.hasTimeframe ? (
        <p className="text-xs text-muted-foreground">
          은퇴까지 남은 기간도 적으면 지금 페이스로 목표에 닿을지 보여드립니다.
        </p>
      ) : (
        <p className="text-xs leading-relaxed text-muted-foreground">
          지금 페이스(매달 남는 돈)가 그대로 이어지면 은퇴 시점 예상 총자산은{" "}
          <b className="font-semibold text-foreground">{formatWon(goal.projectedTotal ?? 0)}</b>
          입니다. {goal.meetsGoal ? "목표에 도달합니다." : "목표에 못 미칩니다."}
        </p>
      )}
    </div>
  );
}
