"use client";

import { useEffect, useState } from "react";
import { Loader2Icon, PlusIcon, RefreshCwIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { digitsOnly, formatNumber, formatPercent, formatWon } from "@/lib/format";
import { marketValue, profit, purchaseAmount, returnRate, summarize } from "../calculate";
import { fetchQuote } from "../quote-client";
import { loadHoldings, nextId, saveHoldings } from "../storage";
import type { Holding } from "../types";

const TICKER_PATTERN = /^\d{6}$/;

export function HoldingsPanel() {
  const [holdings, setHoldings] = useState<Holding[]>(() => loadHoldings());
  const [ticker, setTicker] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  useEffect(() => {
    saveHoldings(holdings);
  }, [holdings]);

  function updateHolding(id: string, patch: Partial<Pick<Holding, "quantity" | "avgBuyPrice">>) {
    setHoldings((current) => current.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }

  function removeHolding(id: string) {
    setHoldings((current) => current.filter((h) => h.id !== id));
  }

  async function addHolding() {
    if (!TICKER_PATTERN.test(ticker)) {
      setAddError("종목코드는 6자리 숫자여야 합니다.");
      return;
    }
    if (holdings.some((h) => h.ticker === ticker)) {
      setAddError("이미 등록된 종목입니다.");
      return;
    }

    setAdding(true);
    setAddError(null);
    const quote = await fetchQuote(ticker);
    setAdding(false);

    if (!quote) {
      setAddError("존재하지 않는 종목코드이거나 조회에 실패했습니다.");
      return;
    }

    setHoldings((current) => [
      ...current,
      {
        id: nextId(),
        ticker,
        name: quote.name,
        quantity: 0,
        avgBuyPrice: 0,
        lastPrice: quote.price,
        lastPriceAt: new Date().toISOString(),
      },
    ]);
    setTicker("");
  }

  async function refreshAll() {
    if (holdings.length === 0) return;

    setRefreshing(true);
    setRefreshError(null);
    const snapshot = holdings;
    const results = await Promise.all(snapshot.map((h) => fetchQuote(h.ticker)));
    const failedCount = results.filter((r) => r === null).length;

    setHoldings((current) =>
      current.map((h) => {
        const index = snapshot.findIndex((s) => s.id === h.id);
        const result = index === -1 ? undefined : results[index];
        return result
          ? { ...h, lastPrice: result.price, lastPriceAt: new Date().toISOString() }
          : h;
      })
    );
    setRefreshError(failedCount > 0 ? `${failedCount}개 종목 조회에 실패해 이전 값을 유지합니다.` : null);
    setRefreshing(false);
  }

  const totals = summarize(holdings);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>종목 추가</CardTitle>
          <CardDescription>
            종목코드 6자리를 입력하면 종목명과 그 시점 전일 종가를 조회해 채웁니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              aria-label="종목코드"
              className="tabular-nums"
              inputMode="numeric"
              placeholder="예: 102110"
              value={ticker}
              onChange={(event) => {
                setTicker(digitsOnly(event.target.value).slice(0, 6));
                setAddError(null);
              }}
            />
            <Button disabled={adding} type="button" onClick={addHolding}>
              {adding ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
              추가
            </Button>
          </div>
          {addError ? <p className="text-sm text-destructive">{addError}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>보유 현황</CardTitle>
          <CardDescription>매입금액, 평가금액, 평가손익을 종목별과 전체 합계로 보여줍니다.</CardDescription>
          <CardAction>
            <Button disabled={refreshing || holdings.length === 0} type="button" variant="outline" onClick={refreshAll}>
              <RefreshCwIcon className={cn(refreshing && "animate-spin")} />
              종가 새로고침
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {refreshError ? <p className="text-sm text-destructive">{refreshError}</p> : null}

          {holdings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              아직 등록한 종목이 없습니다. 위에서 종목코드를 입력해 추가하세요.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 rounded-lg border p-3 sm:grid-cols-4">
                <TotalCell label="매입금액" value={formatWon(totals.totalPurchaseAmount)} />
                <TotalCell label="평가금액" value={formatWon(totals.totalMarketValue)} />
                <TotalCell
                  label="평가손익"
                  negative={totals.totalProfit < 0}
                  value={formatWon(totals.totalProfit)}
                />
                <TotalCell
                  label="수익률"
                  negative={(totals.totalReturnRate ?? 0) < 0}
                  value={totals.totalReturnRate === null ? "-" : formatPercent(totals.totalReturnRate)}
                />
              </div>

              <ul className="flex flex-col gap-3">
                {holdings.map((holding) => (
                  <HoldingRow
                    key={holding.id}
                    holding={holding}
                    onChange={(patch) => updateHolding(holding.id, patch)}
                    onRemove={() => removeHolding(holding.id)}
                  />
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TotalCell({ label, value, negative }: { label: string; value: string; negative?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-semibold tabular-nums", negative && "text-destructive")}>
        {value}
      </span>
    </div>
  );
}

function HoldingRow({
  holding,
  onChange,
  onRemove,
}: {
  holding: Holding;
  onChange: (patch: Partial<Pick<Holding, "quantity" | "avgBuyPrice">>) => void;
  onRemove: () => void;
}) {
  const amount = purchaseAmount(holding);
  const value = marketValue(holding);
  const gain = profit(holding);
  const rate = returnRate(holding);

  return (
    <li className="flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">
          {holding.name} <span className="text-xs text-muted-foreground">({holding.ticker})</span>
        </span>
        <Button
          aria-label={`${holding.name} 삭제`}
          size="icon-sm"
          type="button"
          variant="ghost"
          className="text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <XIcon />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="수량"
          value={holding.quantity}
          onChange={(quantity) => onChange({ quantity })}
        />
        <NumberField
          label="매수단가"
          value={holding.avgBuyPrice}
          onChange={(avgBuyPrice) => onChange({ avgBuyPrice })}
        />
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <Badge variant="outline">
          <span className="text-muted-foreground">매입금액</span>
          <span className="font-semibold">{formatWon(amount)}</span>
        </Badge>
        <Badge variant="outline">
          <span className="text-muted-foreground">평가금액</span>
          <span className="font-semibold">{holding.lastPrice === null ? "-" : formatWon(value)}</span>
        </Badge>
        <Badge variant={gain < 0 ? "destructive" : "outline"}>
          <span className={gain < 0 ? "" : "text-muted-foreground"}>평가손익</span>
          <span className="font-semibold">{formatWon(gain)}</span>
        </Badge>
        <Badge variant={(rate ?? 0) < 0 ? "destructive" : "outline"}>
          <span className={(rate ?? 0) < 0 ? "" : "text-muted-foreground"}>수익률</span>
          <span className="font-semibold">{rate === null ? "-" : formatPercent(rate)}</span>
        </Badge>
      </div>
    </li>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Input
        aria-label={label}
        className="text-right tabular-nums"
        inputMode="numeric"
        placeholder="0"
        value={value ? formatNumber(value) : ""}
        onChange={(event) => onChange(Number(digitsOnly(event.target.value) || 0))}
      />
    </label>
  );
}
