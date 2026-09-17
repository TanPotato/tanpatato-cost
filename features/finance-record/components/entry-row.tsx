"use client";

import { XIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { digitsOnly, formatNumber } from "@/lib/format";

/**
 * 기록 화면의 모든 목록이 쓰는 한 줄. 좁은 화면에서는 이름과 삭제가 윗줄로,
 * 금액과 나머지가 아랫줄로 쌓인다.
 */
export function EntryRow({
  name,
  namePlaceholder,
  onNameChange,
  onRemove,
  second,
  third,
}: {
  name: string;
  namePlaceholder: string;
  onNameChange: (value: string) => void;
  onRemove: () => void;
  second: ReactNode;
  third?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid items-center gap-2",
        "grid-cols-[minmax(0,1fr)_5.75rem_2rem]",
        third
          ? "sm:grid-cols-[minmax(0,1fr)_8rem_5.75rem_2rem]"
          : "sm:grid-cols-[minmax(0,1fr)_8rem_2rem]"
      )}
    >
      <Input
        aria-label="항목 이름"
        className="col-span-2 col-start-1 row-start-1 sm:col-span-1"
        placeholder={namePlaceholder}
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
      />
      <Button
        aria-label={`${name || "이름 없는 항목"} 지우기`}
        className="col-start-3 row-start-1 text-muted-foreground hover:text-destructive sm:row-start-1"
        size="icon-sm"
        type="button"
        variant="ghost"
        onClick={onRemove}
      >
        <XIcon />
      </Button>
      <div className="col-start-1 row-start-2 sm:col-start-2 sm:row-start-1">{second}</div>
      {third ? (
        <div className="col-span-2 col-start-2 row-start-2 sm:col-span-1 sm:col-start-3 sm:row-start-1">
          {third}
        </div>
      ) : null}
    </div>
  );
}

/** 입력하는 동안 천 단위 구분을 붙여 준다. 자릿수를 세지 않고도 금액을 확인할 수 있다. */
export function AmountInput({
  label,
  value,
  onChange,
  placeholder = "0",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}) {
  return (
    <Input
      aria-label={label}
      className="text-right tabular-nums"
      inputMode="numeric"
      placeholder={placeholder}
      value={value ? formatNumber(value) : ""}
      onChange={(event) => onChange(Number(digitsOnly(event.target.value) || 0))}
    />
  );
}

/** 금리처럼 소수점을 찍는 값은 입력하는 도중에도 값이 사라지면 안 된다. */
function keepDecimal(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  return rest.length > 0 ? `${whole}.${rest.join("")}` : whole;
}

export function PlainNumberInput({
  label,
  value,
  onChange,
  placeholder,
  maxLength = 3,
  allowDecimal = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  allowDecimal?: boolean;
}) {
  return (
    <Input
      aria-label={label}
      className="text-right tabular-nums"
      inputMode={allowDecimal ? "decimal" : "numeric"}
      placeholder={placeholder}
      value={value}
      onChange={(event) => {
        const raw = event.target.value;
        const next = allowDecimal ? keepDecimal(raw) : digitsOnly(raw);
        onChange(next.slice(0, maxLength));
      }}
    />
  );
}
