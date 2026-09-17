import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, test } from "vitest";

import { FinanceRecordScreen } from "./finance-record-screen";
import { emptyRecord } from "./seed";

beforeEach(() => {
  window.localStorage.clear();
});

function surplusCell() {
  return screen.getByText("매달 남는 돈").closest("div") as HTMLElement;
}

test("금액을 적는 동안 매달 남는 돈이 따라 바뀐다", () => {
  render(<FinanceRecordScreen />);

  expect(within(surplusCell()).getByText("0원")).toBeInTheDocument();

  const amounts = screen.getAllByLabelText("금액");
  fireEvent.change(amounts[0], { target: { value: "5000000" } });
  fireEvent.change(amounts[1], { target: { value: "1200000" } });

  expect(within(surplusCell()).getByText("3,800,000원")).toBeInTheDocument();
  expect(amounts[0]).toHaveValue("5,000,000");
});

test("지난 기록을 불러온 뒤 항목을 더 넣어도 줄끼리 서로 영향을 주지 않는다", () => {
  window.localStorage.setItem(
    "tanpotato.finance-record.v1",
    JSON.stringify({
      ...emptyRecord(),
      expenses: [{ id: "expense-1", name: "아파트 관리비", amount: 285000, cycle: "month" }],
    })
  );

  render(<FinanceRecordScreen />);

  const addExpense = screen.getByRole("button", { name: "지출 항목 추가" });
  fireEvent.click(addExpense);
  fireEvent.click(addExpense);

  const names = screen.getAllByLabelText("항목 이름");
  const newest = names[names.length - 1];
  fireEvent.change(newest, { target: { value: "재산세" } });

  expect(screen.getAllByDisplayValue("재산세")).toHaveLength(1);
  expect(screen.getByDisplayValue("아파트 관리비")).toBeInTheDocument();
});

test("지금 모양보다 오래된 기록을 불러와도 적어 둔 금액을 잃지 않는다", () => {
  window.localStorage.setItem(
    "tanpotato.finance-record.v1",
    JSON.stringify({
      incomes: [{ id: "income-1", name: "급여(세후)", amount: 4_000_000, cycle: "month" }],
      expenses: [],
      assets: [],
      debts: [],
      // 부양가족으로 합치기 전의 모양. dependents가 없다.
      profile: { age: "48", yearsToRetirement: "12", household: "spouse", children: [] },
    })
  );

  render(<FinanceRecordScreen />);

  expect(within(surplusCell()).getByText("4,000,000원")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("tab", { name: "진단" }));
  expect(screen.getByText("없음")).toBeInTheDocument();
});

test("아무것도 적지 않았으면 진단 대신 기록하러 가라고 안내한다", () => {
  render(<FinanceRecordScreen />);

  fireEvent.click(screen.getByRole("tab", { name: "진단" }));
  expect(screen.getByText("아직 진단할 것이 없습니다")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "수입·지출 기록하러 가기" }));
  expect(
    screen.getByRole("heading", { level: 1, name: "매달 들어오고 나가는 돈" })
  ).toBeInTheDocument();
});

test("추천 탭은 항상 3종목과 비중·금액을 보여주고, 성향을 바꾸면 다시 계산된다", () => {
  const { container } = render(<FinanceRecordScreen />);

  const amounts = screen.getAllByLabelText("금액");
  fireEvent.change(amounts[0], { target: { value: "2000000" } });

  fireEvent.click(screen.getByRole("tab", { name: "추천" }));
  expect(screen.getByText("TIGER 200")).toBeInTheDocument();
  expect(screen.getByText("TIGER 미국S&P500")).toBeInTheDocument();
  expect(screen.getByText("KODEX 종합채권(AA-이상)액티브")).toBeInTheDocument();
  // 기본 성향 3단계는 상한 없이 50:50이라 국내 15% / 해외 35% / 채권 50%다.
  expect(screen.getByText("15%", { exact: false })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("tab", { name: "내 상황" }));
  const aggressive = screen.getByRole("radio", { name: /5\s*공격형/ });
  fireEvent.click(aggressive);
  const oneYear = screen.getByRole("button", { name: "1년" });
  fireEvent.click(oneYear);

  fireEvent.click(screen.getByRole("tab", { name: "추천" }));
  expect(screen.getByText(/낮췄습니다/)).toBeInTheDocument();
  expect(container.textContent).toContain("60%");
});

test("매달 남는 돈이 0원 이하면 추천 비중은 그대로 나오고 금액만 0원이다", () => {
  render(<FinanceRecordScreen />);

  fireEvent.click(screen.getByRole("tab", { name: "추천" }));
  const amounts = screen.getAllByText("0원");
  expect(amounts.length).toBeGreaterThanOrEqual(3);
});
