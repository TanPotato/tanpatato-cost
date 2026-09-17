import type { Holding, HoldingTotals } from "./types";

export function purchaseAmount(holding: Holding): number {
  return holding.quantity * holding.avgBuyPrice;
}

export function marketValue(holding: Holding): number {
  return holding.quantity * (holding.lastPrice ?? 0);
}

export function profit(holding: Holding): number {
  return marketValue(holding) - purchaseAmount(holding);
}

/** 매입금액이 0이면 0으로 나누는 값이 되어 의미가 없으므로 null을 낸다. */
export function returnRate(holding: Holding): number | null {
  const amount = purchaseAmount(holding);
  return amount === 0 ? null : profit(holding) / amount;
}

export function summarize(holdings: Holding[]): HoldingTotals {
  const totalPurchaseAmount = holdings.reduce((sum, h) => sum + purchaseAmount(h), 0);
  const totalMarketValue = holdings.reduce((sum, h) => sum + marketValue(h), 0);
  const totalProfit = totalMarketValue - totalPurchaseAmount;

  return {
    totalPurchaseAmount,
    totalMarketValue,
    totalProfit,
    totalReturnRate: totalPurchaseAmount === 0 ? null : totalProfit / totalPurchaseAmount,
  };
}
