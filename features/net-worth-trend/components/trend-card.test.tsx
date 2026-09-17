import { render, screen } from "@testing-library/react";
import { beforeEach, expect, test } from "vitest";

import { TrendCard } from "./trend-card";
import { saveSnapshots } from "../storage";

beforeEach(() => {
  window.localStorage.clear();
});

test("자산·부채도 안 적고 보유 종목도 없으면 기록하지 않고 안내만 보여준다", () => {
  render(<TrendCard hasBalanceRecord={false} netWorth={0} />);

  expect(
    screen.getByText("자산·부채나 보유 종목을 적으면 총자산 추이가 기록됩니다.")
  ).toBeInTheDocument();
  const raw = window.localStorage.getItem("tanpotato.net-worth-trend.v1");
  expect(raw ? JSON.parse(raw) : []).toEqual([]);
});

test("자산·부채를 적었으면 오늘 기록이 남고, 기록이 하나뿐이면 지금 값만 보여준다", () => {
  render(<TrendCard hasBalanceRecord netWorth={1_500_000} />);

  expect(screen.getByText("지금 총자산")).toBeInTheDocument();
  expect(screen.getByText("1,500,000원")).toBeInTheDocument();

  const saved = JSON.parse(window.localStorage.getItem("tanpotato.net-worth-trend.v1")!);
  expect(saved).toHaveLength(1);
  expect(saved[0].totalAssets).toBe(1_500_000);
});

test("같은 날 다시 열어도(재마운트) 기록이 하나로 유지되고 최신 값으로 바뀐다", () => {
  const { unmount } = render(<TrendCard hasBalanceRecord netWorth={1_000_000} />);
  unmount();

  render(<TrendCard hasBalanceRecord netWorth={2_000_000} />);

  const saved = JSON.parse(window.localStorage.getItem("tanpotato.net-worth-trend.v1")!);
  expect(saved).toHaveLength(1);
  expect(saved[0].totalAssets).toBe(2_000_000);
});

test("기록이 두 건 이상이면 꺾은선 그래프가 나온다", () => {
  saveSnapshots([
    { date: "2026-09-01", totalAssets: 1_000_000 },
    { date: "2026-09-08", totalAssets: 1_200_000 },
  ]);

  render(<TrendCard hasBalanceRecord={false} netWorth={0} />);

  expect(screen.getByRole("img", { name: /총자산 추이/ })).toBeInTheDocument();
  expect(screen.queryByText("지금 총자산")).not.toBeInTheDocument();
});
