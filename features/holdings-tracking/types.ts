export type Holding = {
  id: string;
  /** 6자리 종목코드. 조회와 새로고침의 식별자다. */
  ticker: string;
  /** 종목명은 사용자가 적지 않고 조회해서 채운다. */
  name: string;
  quantity: number;
  /** 1주당 매수단가. 사용자가 직접 입력한다. */
  avgBuyPrice: number;
  /** 가장 최근에 성공적으로 조회한 전일 종가. 아직 한 번도 조회하지 못했으면 null. */
  lastPrice: number | null;
  /** lastPrice를 조회한 시각(ISO). lastPrice가 null이면 이 값도 null. */
  lastPriceAt: string | null;
};

export type HoldingTotals = {
  totalPurchaseAmount: number;
  totalMarketValue: number;
  totalProfit: number;
  /** 매입금액 합이 0이면 계산할 수 없어 null. */
  totalReturnRate: number | null;
};
