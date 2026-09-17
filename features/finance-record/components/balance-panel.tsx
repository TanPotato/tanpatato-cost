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

import { formatWon } from "@/lib/format";
import { nextId } from "../seed";
import type { AssetEntry, DebtEntry } from "../types";
import { AmountInput, EntryRow, PlainNumberInput } from "./entry-row";

export function BalancePanel({
  assets,
  debts,
  assetTotal,
  debtTotal,
  onAssetsChange,
  onDebtsChange,
}: {
  assets: AssetEntry[];
  debts: DebtEntry[];
  assetTotal: number;
  debtTotal: number;
  onAssetsChange: (entries: AssetEntry[]) => void;
  onDebtsChange: (entries: DebtEntry[]) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>보유 자산</CardTitle>
          <CardDescription>
            예적금, 퇴직연금, 연금저축, 부동산, 이미 투자 중인 종목까지 적습니다.
          </CardDescription>
          <CardAction className="text-sm font-semibold tabular-nums">
            {formatWon(assetTotal)}
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {assets.map((asset) => (
            <EntryRow
              key={asset.id}
              name={asset.name}
              namePlaceholder="예: 개인연금"
              onNameChange={(name) =>
                onAssetsChange(
                  assets.map((item) => (item.id === asset.id ? { ...item, name } : item))
                )
              }
              onRemove={() => onAssetsChange(assets.filter((item) => item.id !== asset.id))}
              second={
                <AmountInput
                  label="평가금액"
                  value={asset.amount}
                  onChange={(amount) =>
                    onAssetsChange(
                      assets.map((item) =>
                        item.id === asset.id ? { ...item, amount } : item
                      )
                    )
                  }
                />
              }
            />
          ))}
          <Button
            className="w-full border-dashed"
            type="button"
            variant="outline"
            onClick={() =>
              onAssetsChange([...assets, { id: nextId("asset"), name: "", amount: 0 }])
            }
          >
            <PlusIcon data-icon="inline-start" />
            자산 항목 추가
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>대출</CardTitle>
          <CardDescription>
            잔액과 금리를 함께 적으면 매달 나가는 이자가 어디서 오는지 이어서 볼 수 있습니다.
          </CardDescription>
          <CardAction className="text-sm font-semibold tabular-nums">
            {formatWon(debtTotal)}
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {debts.map((debt) => {
            const replace = (patch: Partial<DebtEntry>) =>
              onDebtsChange(
                debts.map((item) => (item.id === debt.id ? { ...item, ...patch } : item))
              );

            return (
              <EntryRow
                key={debt.id}
                name={debt.name}
                namePlaceholder="예: 신용대출"
                onNameChange={(name) => replace({ name })}
                onRemove={() => onDebtsChange(debts.filter((item) => item.id !== debt.id))}
                second={
                  <AmountInput
                    label="잔액"
                    value={debt.amount}
                    onChange={(amount) => replace({ amount })}
                  />
                }
                third={
                  <RateInput value={debt.rate} onChange={(rate) => replace({ rate })} />
                }
              />
            );
          })}
          <Button
            className="w-full border-dashed"
            type="button"
            variant="outline"
            onClick={() =>
              onDebtsChange([
                ...debts,
                { id: nextId("debt"), name: "", amount: 0, rate: "" },
              ])
            }
          >
            <PlusIcon data-icon="inline-start" />
            대출 항목 추가
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/** 금리는 소수점을 찍는 중에도 값이 사라지면 안 되므로 적은 그대로 둔다. */
function RateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <PlainNumberInput
      allowDecimal
      label="금리"
      maxLength={6}
      placeholder="0.0"
      value={value}
      onChange={onChange}
    />
  );
}
