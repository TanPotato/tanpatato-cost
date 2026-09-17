"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { HORIZON_CHOICES } from "../diagnose";
import { formatHorizon, formatNumber, formatPercent, formatWon } from "../format";
import type { CycleKey, Diagnosis, FinanceRecord, Summary } from "../types";
import { HOUSEHOLD_LABELS, RISK_LABELS } from "./profile-panel";

const CYCLE_TEXT: Record<CycleKey, string> = {
  month: "매달",
  quarter: "분기",
  half: "반년",
  year: "1년",
};

const LONGEST_HORIZON = HORIZON_CHOICES[HORIZON_CHOICES.length - 1];

export function DiagnosisPanel({
  record,
  summary,
  diagnosis,
  onGoToRecord,
}: {
  record: FinanceRecord;
  summary: Summary;
  diagnosis: Diagnosis;
  onGoToRecord: () => void;
}) {
  if (summary.isBlank) {
    return (
      <Empty className="rounded-xl border">
        <EmptyHeader>
          <EmptyTitle>아직 진단할 것이 없습니다</EmptyTitle>
          <EmptyDescription>
            수입과 지출을 먼저 적어 주세요. 항목 몇 개만 적어도 매달 남는 돈이 바로
            보입니다.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button type="button" onClick={onGoToRecord}>
            수입·지출 기록하러 가기
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const deficit = summary.monthlySurplus < 0;
  const topMonthly = diagnosis.rankedExpenses[0]?.monthlyAmount ?? 1;
  const children = record.profile.children.filter((child) => child.name || child.age);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="py-2">
          <p className="text-sm text-muted-foreground">매달 남는 돈</p>
          <p
            className={cn(
              "mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-4xl font-bold tracking-tighter tabular-nums sm:text-5xl",
              deficit && "text-destructive"
            )}
          >
            <span>
              {formatNumber(summary.monthlySurplus)}
              <span className="ml-0.5 text-2xl font-semibold">원</span>
            </span>
            <Badge
              className="font-normal tracking-normal"
              variant={deficit ? "destructive" : "outline"}
            >
              {deficit ? "매달 모자랍니다" : "투자에 쓸 수 있는 최대치"}
            </Badge>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            월 수입 {formatWon(summary.monthlyIncome)}에서 월 지출{" "}
            {formatWon(summary.monthlyExpense)}을 뺀 금액입니다.
          </p>
        </CardContent>
      </Card>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4">
        <KeyFigure
          aside={`항목 ${record.incomes.length}개`}
          label="월 수입"
          value={formatWon(summary.monthlyIncome)}
        />
        <KeyFigure
          aside={`항목 ${record.expenses.length}개`}
          label="월 지출"
          value={formatWon(summary.monthlyExpense)}
        />
        <KeyFigure
          aside="수입 대비 남는 비율"
          label="저축률"
          value={summary.savingRate === null ? "—" : formatPercent(summary.savingRate)}
        />
        <KeyFigure
          aside={
            summary.hasBalanceRecord
              ? `자산 ${formatWon(summary.assetTotal)} − 부채 ${formatWon(summary.debtTotal)}`
              : "자산·부채를 적으면 보입니다"
          }
          label="순자산"
          value={summary.hasBalanceRecord ? formatWon(summary.netWorth) : "기록 전"}
        />
      </dl>

      <Card>
        <CardHeader>
          <CardTitle>지출은 어디로 가고 있나</CardTitle>
          <CardAction className="text-xs text-muted-foreground">
            월 환산 기준, 큰 항목부터
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ul className="flex flex-col gap-3">
            {diagnosis.rankedExpenses.map((expense) => (
              <li key={expense.id} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm">{expense.name}</span>
                  <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
                    <b className="font-semibold text-foreground">
                      {formatWon(expense.monthlyAmount)}
                    </b>{" "}
                    · {formatPercent(expense.share)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.max(2, (expense.monthlyAmount / topMonthly) * 100)}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>

          <details className="text-sm">
            <summary className="cursor-pointer text-xs text-muted-foreground">
              표로 보기
            </summary>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>항목</TableHead>
                  <TableHead className="text-right">입력값</TableHead>
                  <TableHead className="text-right">주기</TableHead>
                  <TableHead className="text-right">월 환산</TableHead>
                  <TableHead className="text-right">비중</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diagnosis.rankedExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatWon(expense.rawAmount)}
                    </TableCell>
                    <TableCell className="text-right">{CYCLE_TEXT[expense.cycle]}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatWon(expense.monthlyAmount)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPercent(expense.share)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </details>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>눈여겨볼 것</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-3">
            {diagnosis.notes.map((note) => (
              <li key={note.id} className="flex gap-3 text-sm leading-relaxed">
                <span
                  aria-hidden
                  className={cn(
                    "w-1 shrink-0 rounded-full",
                    note.tone === "warn" ? "bg-destructive" : "bg-border"
                  )}
                />
                <span>{note.text}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>진단에 반영된 내 상황</CardTitle>
          <CardDescription>
            이 값은 다음 단계인 포트폴리오 추천에서 그대로 쓰입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Fact label="나이" value={record.profile.age ? `${record.profile.age}세` : "미입력"} />
          <Fact
            label="은퇴까지"
            value={
              record.profile.yearsToRetirement
                ? `${record.profile.yearsToRetirement}년`
                : "미입력"
            }
          />
          <Fact
            label="가족"
            value={HOUSEHOLD_LABELS.get(record.profile.household) ?? "미입력"}
          />
          <Fact
            label="자녀"
            value={
              children.length > 0
                ? `${children.length}명 (${children
                    .map((child) => (child.age ? `${child.age}세` : "나이 미입력"))
                    .join(", ")})`
                : "없음"
            }
          />
          <Fact
            label="투자 기간"
            value={formatHorizon(record.profile.horizonYears, LONGEST_HORIZON)}
          />
          <Fact
            label="성향"
            value={`${record.profile.riskLevel}단계 ${RISK_LABELS.get(record.profile.riskLevel) ?? ""}`}
          />
        </CardContent>
      </Card>

      <p className="text-xs leading-relaxed text-muted-foreground">
        이 숫자를 바탕으로 한 ETF 포트폴리오 추천과 실행 안내는 다음 단계입니다.
      </p>
    </div>
  );
}

function KeyFigure({
  label,
  value,
  aside,
}: {
  label: string;
  value: string;
  aside: string;
}) {
  return (
    <div className="bg-card px-3.5 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-base font-semibold tracking-tight tabular-nums">{value}</dd>
      <dd className="mt-1 text-xs leading-snug text-muted-foreground">{aside}</dd>
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
