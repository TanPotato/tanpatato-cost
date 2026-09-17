import { render, screen } from "@testing-library/react";
import { beforeEach, expect, test } from "vitest";

import { TrendCard } from "./trend-card";
import { saveSnapshots } from "../storage";

beforeEach(() => {
  window.localStorage.clear();
});

test("자산·부채도 안 적고 보유 종목도 없으면 기록하지 않고 안내만 보여준다", () => {
  render(<TrendCard hasBalanceRecord={false} monthlySurplus={0} netWorth={0} retirementGoalAmount={0} yearsToRetirement={null} />);

  expect(
    screen.getByText("자산·부채나 보유 종목을 적으면 총자산 추이가 기록됩니다.")
  ).toBeInTheDocument();
  const raw = window.localStorage.getItem("tanpotato.net-worth-trend.v1");
  expect(raw ? JSON.parse(raw) : []).toEqual([]);
});

test("자산·부채를 적었으면 오늘 기록이 남고, 기록이 하나뿐이면 지금 값만 보여준다", () => {
  render(<TrendCard hasBalanceRecord monthlySurplus={0} netWorth={1_500_000} retirementGoalAmount={0} yearsToRetirement={null} />);

  expect(screen.getByText("지금 총자산")).toBeInTheDocument();
  expect(screen.getByText("1,500,000원")).toBeInTheDocument();

  const saved = JSON.parse(window.localStorage.getItem("tanpotato.net-worth-trend.v1")!);
  expect(saved).toHaveLength(1);
  expect(saved[0].totalAssets).toBe(1_500_000);
});

test("같은 날 다시 열어도(재마운트) 기록이 하나로 유지되고 최신 값으로 바뀐다", () => {
  const { unmount } = render(<TrendCard hasBalanceRecord monthlySurplus={0} netWorth={1_000_000} retirementGoalAmount={0} yearsToRetirement={null} />);
  unmount();

  render(<TrendCard hasBalanceRecord monthlySurplus={0} netWorth={2_000_000} retirementGoalAmount={0} yearsToRetirement={null} />);

  const saved = JSON.parse(window.localStorage.getItem("tanpotato.net-worth-trend.v1")!);
  expect(saved).toHaveLength(1);
  expect(saved[0].totalAssets).toBe(2_000_000);
});

test("기록이 두 건 이상이면 꺾은선 그래프가 나온다", () => {
  saveSnapshots([
    { date: "2026-09-01", totalAssets: 1_000_000 },
    { date: "2026-09-08", totalAssets: 1_200_000 },
  ]);

  render(<TrendCard hasBalanceRecord={false} monthlySurplus={0} netWorth={0} retirementGoalAmount={0} yearsToRetirement={null} />);

  expect(screen.getByRole("img", { name: /총자산 추이/ })).toBeInTheDocument();
  expect(screen.queryByText("지금 총자산")).not.toBeInTheDocument();
});

test("은퇴 목표를 적지 않았으면 진행률 대신 입력 유도 문구가 나온다", () => {
  render(
    <TrendCard
      hasBalanceRecord
      monthlySurplus={1_000_000}
      netWorth={100_000_000}
      retirementGoalAmount={0}
      yearsToRetirement={10}
    />
  );

  expect(
    screen.getByText("내 상황 탭에서 은퇴 목표 총자산을 적으면 진행률을 보여드립니다.")
  ).toBeInTheDocument();
});

test("목표만 있고 은퇴까지 남은 기간이 없으면 진행률만 보이고 기간 입력을 유도한다", () => {
  render(
    <TrendCard
      hasBalanceRecord
      monthlySurplus={1_000_000}
      netWorth={250_000_000}
      retirementGoalAmount={500_000_000}
      yearsToRetirement={null}
    />
  );

  expect(screen.getByText("은퇴 목표 달성률")).toBeInTheDocument();
  expect(screen.getByText("50.0%")).toBeInTheDocument();
  expect(
    screen.getByText("은퇴까지 남은 기간도 적으면 지금 페이스로 목표에 닿을지 보여드립니다.")
  ).toBeInTheDocument();
});

test("목표와 기간이 모두 있으면 예상 은퇴 시점 총자산과 도달 여부가 나온다", () => {
  render(
    <TrendCard
      hasBalanceRecord
      monthlySurplus={2_500_000}
      netWorth={100_000_000}
      retirementGoalAmount={400_000_000}
      yearsToRetirement={10}
    />
  );

  expect(screen.getByText("400,000,000원", { exact: false })).toBeInTheDocument();
  expect(screen.getByText(/목표에 도달합니다\./)).toBeInTheDocument();
});
