/** 어느 날짜의 총자산 값 하나. GLOSSARY.md의 "기록 포인트"다. */
export type Snapshot = {
  /** 로컬 날짜, YYYY-MM-DD. */
  date: string;
  /** 그 날짜에 기록된 총자산(순자산 + 보유 종목 평가금액). */
  totalAssets: number;
};
