"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import { loadCheckedSteps, saveCheckedSteps } from "../storage";
import { buildSteps } from "../steps";
import type { PurchaseTarget, StepId } from "../types";

export function ExecutionPanel({ targets }: { targets: PurchaseTarget[] }) {
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
          <CardContent className="flex gap-3 py-4 text-sm leading-relaxed">
            <span aria-hidden className="w-1 shrink-0 rounded-full bg-sec-6" />
            <span>
              여섯 단계를 모두 마쳤습니다. 실제로 산 종목과 수량을 기록하고 확인하는 기능은 다음
              작업 단위에서 준비합니다.
            </span>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
