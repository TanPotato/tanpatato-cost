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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { formatWon } from "../format";
import { nextId } from "../seed";
import type { CycleKey, FlowEntry } from "../types";
import { AmountInput, EntryRow } from "./entry-row";

const CYCLE_LABELS: { value: CycleKey; label: string }[] = [
  { value: "month", label: "매달" },
  { value: "quarter", label: "분기" },
  { value: "half", label: "반년" },
  { value: "year", label: "1년" },
];

function CycleSelect({
  value,
  onChange,
}: {
  value: CycleKey;
  onChange: (value: CycleKey) => void;
}) {
  return (
    <Select
      items={CYCLE_LABELS}
      value={value}
      onValueChange={(next) => onChange(next as CycleKey)}
    >
      <SelectTrigger aria-label="주기" className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {CYCLE_LABELS.map((cycle) => (
            <SelectItem key={cycle.value} value={cycle.value}>
              {cycle.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function FlowCard({
  accent,
  title,
  description,
  addLabel,
  namePlaceholder,
  entries,
  monthlyTotal,
  onChange,
}: {
  accent: "income" | "expense";
  title: string;
  description: string;
  addLabel: string;
  namePlaceholder: string;
  entries: FlowEntry[];
  monthlyTotal: number;
  onChange: (entries: FlowEntry[]) => void;
}) {
  function replace(id: string, patch: Partial<FlowEntry>) {
    onChange(entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction className="text-sm font-semibold tabular-nums">
          {formatWon(monthlyTotal)} / 월
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {entries.map((entry) => (
          <EntryRow
            key={entry.id}
            name={entry.name}
            namePlaceholder={namePlaceholder}
            onNameChange={(name) => replace(entry.id, { name })}
            onRemove={() => onChange(entries.filter((item) => item.id !== entry.id))}
            second={
              <AmountInput
                label="금액"
                value={entry.amount}
                onChange={(amount) => replace(entry.id, { amount })}
              />
            }
            third={
              <CycleSelect
                value={entry.cycle}
                onChange={(cycle) => replace(entry.id, { cycle })}
              />
            }
          />
        ))}
        <Button
          className={cn(
            // outline variant가 다크에서 자기 배경과 테두리를 따로 잡으므로 짝을 함께 준다.
            "w-full border-dashed",
            accent === "income"
              ? "border-income bg-income-soft text-income hover:bg-income-soft dark:border-income dark:bg-income-soft dark:hover:bg-income-soft"
              : "border-expense bg-expense-soft text-expense hover:bg-expense-soft dark:border-expense dark:bg-expense-soft dark:hover:bg-expense-soft"
          )}
          type="button"
          variant="outline"
          onClick={() =>
            onChange([
              ...entries,
              { id: nextId(accent), name: "", amount: 0, cycle: "month" },
            ])
          }
        >
          <PlusIcon data-icon="inline-start" />
          {addLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

export function CashflowPanel({
  incomes,
  expenses,
  monthlyIncome,
  monthlyExpense,
  onIncomesChange,
  onExpensesChange,
}: {
  incomes: FlowEntry[];
  expenses: FlowEntry[];
  monthlyIncome: number;
  monthlyExpense: number;
  onIncomesChange: (entries: FlowEntry[]) => void;
  onExpensesChange: (entries: FlowEntry[]) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <FlowCard
        accent="income"
        addLabel="수입 항목 추가"
        description="급여, 이자, 배당, 임대료처럼 들어오는 돈을 모두 적습니다."
        entries={incomes}
        monthlyTotal={monthlyIncome}
        namePlaceholder="예: 임대 수입"
        title="수입"
        onChange={onIncomesChange}
      />
      <FlowCard
        accent="expense"
        addLabel="지출 항목 추가"
        description="대출이자, 관리비, 통신비, 생활비, 보험료, 세금까지 나가는 돈을 모두 적습니다."
        entries={expenses}
        monthlyTotal={monthlyExpense}
        namePlaceholder="예: 자동차세"
        title="지출"
        onChange={onExpensesChange}
      />
    </div>
  );
}
