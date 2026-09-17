import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { RebalanceCard } from "./rebalance-card";
import type { HoldingAmount, RecommendedShare } from "../types";

const RECOMMENDED: RecommendedShare[] = [
  { category: "domestic-equity", percent: 15 },
  { category: "overseas-equity", percent: 35 },
  { category: "bond", percent: 50 },
];

test("보유 금액이 없으면 비교 대신 안내 문구가 나온다", () => {
  render(<RebalanceCard holdings={[]} recommended={RECOMMENDED} />);
  expect(screen.getByText(/아직 비교할 보유 금액이 없습니다/)).toBeInTheDocument();
});

test("카테고리별 보유·추천 비중과 기타를 함께 보여준다", () => {
  const holdings: HoldingAmount[] = [
    { ticker: "102110", marketValue: 300_000 },
    { ticker: "360750", marketValue: 300_000 },
    { ticker: "273130", marketValue: 300_000 },
    { ticker: "005930", marketValue: 100_000 },
  ];
  render(<RebalanceCard holdings={holdings} recommended={RECOMMENDED} />);

  expect(screen.getByText("국내주식형")).toBeInTheDocument();
  expect(screen.getByText("기타")).toBeInTheDocument();
  expect(screen.getByText(/후보 ETF 밖의 종목입니다/)).toBeInTheDocument();
});

test("어느 카테고리도 10%p 이상 벌어지지 않으면 재조정 안내가 나오지 않는다", () => {
  const holdings: HoldingAmount[] = [
    { ticker: "102110", marketValue: 150_000 },
    { ticker: "360750", marketValue: 350_000 },
    { ticker: "273130", marketValue: 500_000 },
  ];
  render(<RebalanceCard holdings={holdings} recommended={RECOMMENDED} />);

  expect(screen.queryByText(/재조정을 고려해 보세요/)).not.toBeInTheDocument();
});

test("한 카테고리라도 10%p 이상 벌어지면 재조정 안내와 조정 금액이 나온다", () => {
  const holdings: HoldingAmount[] = [
    { ticker: "102110", marketValue: 300_000 }, // 30%, 추천 15% → 15%p 초과
    { ticker: "360750", marketValue: 350_000 },
    { ticker: "273130", marketValue: 350_000 },
  ];
  render(<RebalanceCard holdings={holdings} recommended={RECOMMENDED} />);

  expect(screen.getByText(/재조정을 고려해 보세요/)).toBeInTheDocument();
  expect(screen.getByText(/추천 비중보다 약 150,000원어치 많습니다/)).toBeInTheDocument();
});
