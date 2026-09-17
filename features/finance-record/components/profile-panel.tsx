"use client";

import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

import { HORIZON_CHOICES } from "../diagnose";
import { formatHorizon, formatWon } from "@/lib/format";
import {
  DEPENDENT_CHOICES,
  RISK_CHOICES,
  describeDependents,
  normalizeDependents,
} from "../profile-options";
import { nextId } from "../seed";
import type { DependentKey, GoalEntry, Profile, RiskLevel } from "../types";
import { AmountInput, EntryRow, PlainNumberInput } from "./entry-row";

const LONGEST_HORIZON = HORIZON_CHOICES[HORIZON_CHOICES.length - 1];

export function ProfilePanel({
  profile,
  onChange,
}: {
  profile: Profile;
  onChange: (patch: Partial<Profile>) => void;
}) {
  const goalTotal = profile.goals.reduce((total, goal) => total + goal.amount, 0);
  const dependents = profile.dependents;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>기본 상황</CardTitle>
          <CardDescription>
            나이와 은퇴까지 남은 기간은 얼마나 오래 투자할 수 있는지를 가릅니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="sm:grid sm:grid-cols-2 sm:gap-4">
            <Field>
              <FieldLabel htmlFor="profile-age">나이</FieldLabel>
              <PlainNumberInput
                label="나이"
                placeholder="세"
                value={profile.age}
                onChange={(age) => onChange({ age })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="profile-retirement">
                은퇴 예정까지 남은 기간(년)
              </FieldLabel>
              <PlainNumberInput
                label="은퇴 예정까지 남은 기간"
                maxLength={2}
                placeholder="년"
                value={profile.yearsToRetirement}
                onChange={(yearsToRetirement) => onChange({ yearsToRetirement })}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>부양가족</CardTitle>
          <CardDescription>
            내 벌이로 함께 사는 사람을 고릅니다. 은퇴까지 얼마를 모아야 하는지가 달라집니다.
          </CardDescription>
          <CardAction className="text-sm font-semibold">
            {describeDependents(dependents)}
          </CardAction>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            aria-label="부양가족"
            className="flex w-full flex-wrap"
            multiple
            value={dependents}
            variant="outline"
            onValueChange={(value) =>
              onChange({
                dependents: normalizeDependents(dependents, value as DependentKey[]),
              })
            }
          >
            {DEPENDENT_CHOICES.map((choice) => (
              <ToggleGroupItem
                key={choice.value}
                className="aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                value={choice.value}
              >
                {choice.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>투자금을 묶어 둘 수 있는 기간</CardTitle>
          <CardDescription>이 돈에 손대지 않고 둘 수 있는 햇수를 고릅니다.</CardDescription>
          <CardAction className="text-sm font-semibold tabular-nums">
            {formatHorizon(profile.horizonYears, LONGEST_HORIZON)}
          </CardAction>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            aria-label="투자금을 묶어 둘 수 있는 기간"
            className="flex w-full flex-wrap"
            value={[String(profile.horizonYears)]}
            variant="outline"
            onValueChange={(value) => {
              const picked = Number(value[0]);
              if (picked) onChange({ horizonYears: picked });
            }}
          >
            {HORIZON_CHOICES.map((years) => (
              <ToggleGroupItem
                key={years}
                // 열두 개 중 하나를 고르는 자리라 고른 것이 분명히 드러나야 한다.
                className="min-w-16 tabular-nums aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                value={String(years)}
              >
                {years === LONGEST_HORIZON ? `${years}년+` : `${years}년`}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>예정된 목돈 지출</CardTitle>
          <CardDescription>
            자녀 학자금, 전세 보증금, 차량 교체처럼 미리 알고 있는 큰 지출을 적습니다.
          </CardDescription>
          <CardAction className="text-sm font-semibold tabular-nums">
            {formatWon(goalTotal)}
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {profile.goals.map((goal) => {
            const replace = (patch: Partial<GoalEntry>) =>
              onChange({
                goals: profile.goals.map((item) =>
                  item.id === goal.id ? { ...item, ...patch } : item
                ),
              });

            return (
              <EntryRow
                key={goal.id}
                name={goal.name}
                namePlaceholder="예: 차량 교체"
                onNameChange={(name) => replace({ name })}
                onRemove={() =>
                  onChange({ goals: profile.goals.filter((item) => item.id !== goal.id) })
                }
                second={
                  <AmountInput
                    label="금액"
                    value={goal.amount}
                    onChange={(amount) => replace({ amount })}
                  />
                }
                third={
                  <PlainNumberInput
                    label="몇 년 후"
                    maxLength={2}
                    placeholder="년"
                    value={goal.yearsAway}
                    onChange={(yearsAway) => replace({ yearsAway })}
                  />
                }
              />
            );
          })}
          <Button
            className="w-full border-dashed"
            type="button"
            variant="outline"
            onClick={() =>
              onChange({
                goals: [
                  ...profile.goals,
                  { id: nextId("goal"), name: "", amount: 0, yearsAway: "" },
                ],
              })
            }
          >
            <PlusIcon data-icon="inline-start" />
            목돈 지출 추가
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <FieldSet>
            <FieldLegend>투자 성향</FieldLegend>
            <CardDescription>
              원금이 한동안 줄어드는 것을 어디까지 견딜 수 있는지 고릅니다.
            </CardDescription>
            <RadioGroup
              className="mt-3 grid gap-2 sm:grid-cols-5"
              value={String(profile.riskLevel)}
              onValueChange={(value) =>
                onChange({ riskLevel: Number(value) as RiskLevel })
              }
            >
              {RISK_CHOICES.map((choice) => (
                <FieldLabel
                  key={choice.value}
                  className={cn(
                    "flex w-full cursor-pointer flex-col items-start gap-1 rounded-lg border p-3",
                    profile.riskLevel === choice.value && "border-primary bg-accent"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={String(choice.value)} />
                    <span className="text-sm font-semibold">
                      {choice.value} {choice.name}
                    </span>
                  </div>
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {choice.description}
                  </span>
                </FieldLabel>
              ))}
            </RadioGroup>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>안정형</span>
              <span>공격형</span>
            </div>
          </FieldSet>
        </CardContent>
      </Card>
    </div>
  );
}
