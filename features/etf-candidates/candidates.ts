import type { Category, EtfCandidate } from "./types";

/**
 * 카테고리 순서. 화면과 진단이 같은 순서를 쓰도록 이 배열이 기준이 된다.
 */
export const CATEGORIES: Category[] = ["domestic-equity", "overseas-equity", "bond"];

/** 카테고리를 화면에 적을 때 쓰는 이름. GLOSSARY.md의 정의와 같다. */
export const CATEGORY_LABELS: Record<Category, string> = {
  "domestic-equity": "국내주식형",
  "overseas-equity": "해외주식형",
  bond: "채권형",
};

/**
 * 후보 ETF 목록. 사람이 직접 골라 적은 정적 데이터다. 순자산규모와 총보수를
 * 기준으로 골랐고, 그 근거는 docs/decisions/etf-candidate-data.md와
 * docs/specs/etf-candidate-selection/spec.md에 있다.
 *
 * 순자산·총보수 수치는 종목을 고른 근거였을 뿐 이 파일이 유지하는 값이
 * 아니다. 종목코드가 상품명보다 안정적인 식별자다(브랜드명은 개편될 수
 * 있다 — 예: ARIRANG → PLUS ETF).
 */
export const ETF_CANDIDATES: EtfCandidate[] = [
  {
    ticker: "069500",
    name: "KODEX 200",
    category: "domestic-equity",
    index: "코스피200",
  },
  {
    ticker: "102110",
    name: "TIGER 200",
    category: "domestic-equity",
    index: "코스피200",
    note: "KODEX 200과 같은 지수를 추종하며 총보수가 더 낮다.",
  },
  {
    ticker: "360750",
    name: "TIGER 미국S&P500",
    category: "overseas-equity",
    index: "S&P500",
  },
  {
    ticker: "133690",
    name: "TIGER 미국나스닥100",
    category: "overseas-equity",
    index: "나스닥100",
  },
  {
    ticker: "273130",
    name: "KODEX 종합채권(AA-이상)액티브",
    category: "bond",
    index: "KAP 한국종합채권지수(AA- 이상)",
  },
  {
    ticker: "471230",
    name: "KODEX 국고채10년액티브",
    category: "bond",
    index: "KAP 국고채10년지수",
  },
];

export function candidatesByCategory(category: Category): EtfCandidate[] {
  return ETF_CANDIDATES.filter((candidate) => candidate.category === category);
}
