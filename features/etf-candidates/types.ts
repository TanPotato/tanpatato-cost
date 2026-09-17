/**
 * 후보 ETF를 나눈 세 갈래. 국내주식형은 국내 지수를, 해외주식형은 해외 지수를
 * 추종하는 국내 상장 ETF, 채권형은 국채·우량회사채를 담는 국내 상장 ETF다.
 */
export type Category = "domestic-equity" | "overseas-equity" | "bond";

export type EtfCandidate = {
  /** 한국거래소 종목코드. 상품명은 브랜드 개편으로 바뀔 수 있어 이 값을 우선 식별자로 쓴다. */
  ticker: string;
  name: string;
  category: Category;
  /** 이 ETF가 추종하는 지수. */
  index: string;
  note?: string;
};
