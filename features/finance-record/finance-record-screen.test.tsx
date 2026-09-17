import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";

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

test("실행 탭은 여섯 단계를 체크리스트로 보여주고, 체크 상태는 새로 그려도 유지된다", () => {
  const { unmount } = render(<FinanceRecordScreen />);

  const amounts = screen.getAllByLabelText("금액");
  fireEvent.change(amounts[0], { target: { value: "3800000" } });

  fireEvent.click(screen.getByRole("tab", { name: "실행" }));
  const checkboxes = screen.getAllByRole("checkbox");
  expect(checkboxes).toHaveLength(6);

  fireEvent.click(checkboxes[0]);
  expect(checkboxes[0]).toBeChecked();

  unmount();
  render(<FinanceRecordScreen />);
  fireEvent.click(screen.getByRole("tab", { name: "실행" }));
  expect(screen.getAllByRole("checkbox")[0]).toBeChecked();
});

test("실행 탭에서 성향을 바꿔 금액이 달라져도 이미 체크한 단계는 풀리지 않는다", () => {
  render(<FinanceRecordScreen />);

  const amounts = screen.getAllByLabelText("금액");
  fireEvent.change(amounts[0], { target: { value: "3800000" } });

  fireEvent.click(screen.getByRole("tab", { name: "실행" }));
  const checkboxes = screen.getAllByRole("checkbox");
  fireEvent.click(checkboxes[checkboxes.length - 1]);
  expect(checkboxes[checkboxes.length - 1]).toBeChecked();

  fireEvent.click(screen.getByRole("tab", { name: "내 상황" }));
  fireEvent.click(screen.getByRole("radio", { name: /5\s*공격형/ }));

  fireEvent.click(screen.getByRole("tab", { name: "실행" }));
  const afterChange = screen.getAllByRole("checkbox");
  expect(afterChange[afterChange.length - 1]).toBeChecked();
});

test("매달 남는 돈이 0원 이하면 실행 탭의 매수 세 단계는 체크 대신 안내 문구다", () => {
  render(<FinanceRecordScreen />);

  fireEvent.click(screen.getByRole("tab", { name: "실행" }));
  expect(screen.getAllByRole("checkbox")).toHaveLength(3);
  expect(screen.getAllByText(/매달 남는 돈을 만들어/).length).toBeGreaterThanOrEqual(1);
});

test("실행 탭에서 여섯 단계를 모두 마치면 보유 탭으로 이동하는 버튼이 나오고, 눌러면 보유 탭이 열린다", () => {
  render(<FinanceRecordScreen />);

  const amounts = screen.getAllByLabelText("금액");
  fireEvent.change(amounts[0], { target: { value: "3800000" } });

  fireEvent.click(screen.getByRole("tab", { name: "실행" }));
  for (const checkbox of screen.getAllByRole("checkbox")) {
    fireEvent.click(checkbox);
  }

  const goToHoldings = screen.getByRole("button", { name: "보유 종목 기록하기" });
  fireEvent.click(goToHoldings);

  expect(
    screen.getByRole("heading", { level: 1, name: "보유 종목" })
  ).toBeInTheDocument();
});

test("보유 탭에서 종목코드를 적어 종목을 추가할 수 있다", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ticker: "102110", name: "TIGER 200", price: 55000 }), {
        status: 200,
      })
    )
  );

  render(<FinanceRecordScreen />);
  fireEvent.click(screen.getByRole("tab", { name: "보유" }));

  fireEvent.change(screen.getByLabelText("종목코드"), { target: { value: "102110" } });
  fireEvent.click(screen.getByRole("button", { name: "추가" }));

  expect(await screen.findByText(/TIGER 200/)).toBeInTheDocument();
  vi.unstubAllGlobals();
});

test("보유 탭은 등록한 종목을 추천 비중과 비교해 카드로 보여준다", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ticker: "102110", name: "TIGER 200", price: 50_000 }), {
        status: 200,
      })
    )
  );

  render(<FinanceRecordScreen />);
  fireEvent.click(screen.getByRole("tab", { name: "보유" }));

  fireEvent.change(screen.getByLabelText("종목코드"), { target: { value: "102110" } });
  fireEvent.click(screen.getByRole("button", { name: "추가" }));
  await screen.findByText(/TIGER 200/);

  fireEvent.change(screen.getByLabelText("수량"), { target: { value: "10" } });

  // 기본 성향 3단계·7년은 국내 15%인데, 보유는 전부 국내주식형뿐이라 100% — 85%p 초과라 재조정 대상이다.
  expect(await screen.findByText(/재조정을 고려해 보세요/)).toBeInTheDocument();
  expect(screen.getByText("국내주식형")).toBeInTheDocument();
  expect(screen.getByText("기타")).toBeInTheDocument();

  vi.unstubAllGlobals();
});

test("헤더의 내보내기·불러오기 버튼은 어느 탭에서도 보인다", () => {
  render(<FinanceRecordScreen />);

  expect(screen.getByRole("button", { name: "내보내기" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "불러오기" })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("tab", { name: "실행" }));
  expect(screen.getByRole("button", { name: "내보내기" })).toBeInTheDocument();
});

test("자산을 적고 진단 탭을 열면 총자산 추이가 기록되고 지금 값이 보인다", () => {
  render(<FinanceRecordScreen />);

  // 진단 화면은 수입·지출을 하나도 안 적으면 통째로 안내로 바뀌므로, 총자산 추이 카드를
  // 보려면 수입도 함께 적어야 한다.
  fireEvent.change(screen.getAllByLabelText("금액")[0], { target: { value: "1000000" } });

  fireEvent.click(screen.getByRole("tab", { name: "자산·부채" }));
  const addAsset = screen.getByRole("button", { name: "자산 항목 추가" });
  fireEvent.click(addAsset);
  const amounts = screen.getAllByLabelText("평가금액");
  fireEvent.change(amounts[amounts.length - 1], { target: { value: "3000000" } });

  fireEvent.click(screen.getByRole("tab", { name: "진단" }));

  expect(screen.getByText("총자산 추이")).toBeInTheDocument();
  expect(screen.getByText("지금 총자산")).toBeInTheDocument();
  // 순자산(자산-부채)과 총자산 추이의 지금 값이 같은 액수라 두 번 나타난다.
  expect(screen.getAllByText("3,000,000원").length).toBeGreaterThanOrEqual(1);
});

test("내 상황 탭에서 은퇴 목표 총자산을 적으면 진단 탭에 진행률이 보인다", () => {
  render(<FinanceRecordScreen />);

  fireEvent.change(screen.getAllByLabelText("금액")[0], { target: { value: "1000000" } });

  fireEvent.click(screen.getByRole("tab", { name: "자산·부채" }));
  fireEvent.click(screen.getByRole("button", { name: "자산 항목 추가" }));
  const balanceAmounts = screen.getAllByLabelText("평가금액");
  fireEvent.change(balanceAmounts[balanceAmounts.length - 1], {
    target: { value: "5000000" },
  });

  fireEvent.click(screen.getByRole("tab", { name: "내 상황" }));
  fireEvent.change(screen.getByLabelText("은퇴 목표 총자산"), {
    target: { value: "10000000" },
  });

  fireEvent.click(screen.getByRole("tab", { name: "진단" }));

  expect(screen.getByText("은퇴 목표 달성률")).toBeInTheDocument();
  expect(screen.getByText("50.0%")).toBeInTheDocument();
});
