"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import { loadCheckedSteps, saveCheckedSteps } from "../storage";
import { buildSteps } from "../steps";
import type { PurchaseTarget, StepId } from "../types";

export function ExecutionPanel({
  targets,
  onGoToHoldings,
}: {
  targets: PurchaseTarget[];
  /** 여섯 단계를 모두 마쳤을 때 보유 종목 기록 화면으로 이어줄 콜백. 이 모듈은 그 화면을 모른다. */
  onGoToHoldings?: () => void;
}) {
  // 이 화면은 브라우저에서만 그려지므로 첫 렌더에서 곧바로 체크 상태를 읽는다.
  const [checked, setChecked] = useState<StepId[]>(() => loadCheckedSteps());

  useEffect(() => {
    saveCheckedSteps(checked);
  }, [checked]);

  const steps = buildSteps(targets);
  const checkableSteps = steps.filter((step) => step.checkable);
  const allDone =
    checkableSteps.length === steps.length &&
    checkableSteps.every((step) => checked.includes(step.id));

  function toggle(id: StepId) {
    setChecked((current) =>
      current.includes(id) ? current.filter((stepId) => stepId !== id) : [...current, id]
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>실행 안내</CardTitle>
          <CardDescription>
            미래에셋증권 M-STOCK 하나로 추천 종목을 실제로 사기까지 여섯 단계입니다. 마칠 때마다
            체크하면 다음에 다시 열어도 그대로 남아 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-3">
            {steps.map((step) => (
              <li
                key={step.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3",
                  step.checkable && checked.includes(step.id)
                    ? "border-sec-6-soft bg-sec-6-soft"
                    : "border-border"
                )}
              >
                {step.checkable ? (
                  <Checkbox
                    checked={checked.includes(step.id)}
                    onCheckedChange={() => toggle(step.id)}
                    aria-label={step.title}
                    className="mt-0.5"
                  />
                ) : (
                  <span aria-hidden className="mt-0.5 w-4 shrink-0 rounded-full bg-muted" />
                )}
                <div className="flex flex-col gap-0.5">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      step.checkable && checked.includes(step.id) &&
                        "text-muted-foreground line-through"
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {step.description}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {allDone ? (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 py-4 text-sm leading-relaxed">
            <span aria-hidden className="w-1 shrink-0 self-stretch rounded-full bg-sec-6" />
            <span className="flex-1">여섯 단계를 모두 마쳤습니다. 실제로 산 종목과 수량을 기록해 보세요.</span>
            {onGoToHoldings ? (
              <Button type="button" onClick={onGoToHoldings}>
                보유 종목 기록하기
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
