"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { formatWon } from "@/lib/format";
import { loadHoldings } from "@/features/holdings-tracking";
import { currentTotalAssets } from "../current-total";
import { recordSnapshot, todayKey } from "../record";
import { loadSnapshots, saveSnapshots } from "../storage";
import type { Snapshot } from "../types";
import { TrendChart } from "./trend-chart";

export function TrendCard({
  netWorth,
  hasBalanceRecord,
}: {
  netWorth: number;
  hasBalanceRecord: boolean;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>총자산 추이</CardTitle>
        <CardDescription>
          진단 화면을 열 때마다 그 시점 총자산(순자산 + 보유 종목 평가금액)을 기록합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
