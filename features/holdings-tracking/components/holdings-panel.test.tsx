import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { HoldingsPanel } from "./holdings-panel";

function mockQuoteOnce(body: unknown, status = 200) {
  vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(body), { status }));
}

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("유효한 종목코드를 추가하면 종목명과 종가가 채워진 채로 목록에 나타난다", async () => {
  mockQuoteOnce({ ticker: "102110", name: "TIGER 200", price: 26520 });
  render(<HoldingsPanel />);

  fireEvent.change(screen.getByLabelText("종목코드"), { target: { value: "102110" } });
  fireEvent.click(screen.getByRole("button", { name: "추가" }));

  await waitFor(() => expect(screen.getByText(/TIGER 200/)).toBeInTheDocument());
  expect(fetch).toHaveBeenCalledWith("/api/quote/102110");
});

test("6자리가 아닌 종목코드는 조회하지 않고 오류를 보여준다", async () => {
  render(<HoldingsPanel />);

  fireEvent.change(screen.getByLabelText("종목코드"), { target: { value: "123" } });
  fireEvent.click(screen.getByRole("button", { name: "추가" }));

  expect(await screen.findByText("종목코드는 6자리 숫자여야 합니다.")).toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
});

test("존재하지 않는 종목코드는 추가되지 않고 오류를 보여준다", async () => {
  mockQuoteOnce({ error: "not found" }, 404);
  render(<HoldingsPanel />);

  fireEvent.change(screen.getByLabelText("종목코드"), { target: { value: "999999" } });
  fireEvent.click(screen.getByRole("button", { name: "추가" }));

  expect(
    await screen.findByText("존재하지 않는 종목코드이거나 조회에 실패했습니다.")
  ).toBeInTheDocument();
  expect(screen.getByText("아직 등록한 종목이 없습니다. 위에서 종목코드를 입력해 추가하세요.")).toBeInTheDocument();
});

test("수량과 매수단가를 입력하면 매입금액·평가금액·평가손익·수익률이 계산된다", async () => {
  mockQuoteOnce({ ticker: "102110", name: "TIGER 200", price: 55_000 });
  render(<HoldingsPanel />);

  fireEvent.change(screen.getByLabelText("종목코드"), { target: { value: "102110" } });
  fireEvent.click(screen.getByRole("button", { name: "추가" }));
  await screen.findByText(/TIGER 200/);

  fireEvent.change(screen.getByLabelText("수량"), { target: { value: "10" } });
  fireEvent.change(screen.getByLabelText("매수단가"), { target: { value: "50000" } });

  // 종목이 하나뿐이라 전체 합계와 개별 값이 같아 두 번씩 나타난다.
  expect(screen.getAllByText("500,000원").length).toBeGreaterThanOrEqual(1); // 매입금액
  expect(screen.getAllByText("550,000원").length).toBeGreaterThanOrEqual(1); // 평가금액
  expect(screen.getAllByText("50,000원").length).toBeGreaterThanOrEqual(1); // 평가손익
  expect(screen.getAllByText("10.0%").length).toBeGreaterThanOrEqual(1); // 수익률
});

test("새로고침을 누르면 등록된 모든 종목의 가격이 갱신되고, 일부 실패하면 실패 안내가 나온다", async () => {
  mockQuoteOnce({ ticker: "102110", name: "TIGER 200", price: 50_000 });
  mockQuoteOnce({ ticker: "360750", name: "TIGER 미국S&P500", price: 20_000 });
  render(<HoldingsPanel />);

  fireEvent.change(screen.getByLabelText("종목코드"), { target: { value: "102110" } });
  fireEvent.click(screen.getByRole("button", { name: "추가" }));
  await screen.findByText(/TIGER 200/);

  fireEvent.change(screen.getByLabelText("종목코드"), { target: { value: "360750" } });
  fireEvent.click(screen.getByRole("button", { name: "추가" }));
  await screen.findByText(/TIGER 미국S&P500/);

  // 새로고침: 첫 종목은 성공(가격 변경), 둘째 종목은 실패.
  mockQuoteOnce({ ticker: "102110", name: "TIGER 200", price: 60_000 });
  vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ error: "fail" }), { status: 502 }));

  fireEvent.click(screen.getByRole("button", { name: "종가 새로고침" }));

  await waitFor(() =>
    expect(screen.getByText("1개 종목 조회에 실패해 이전 값을 유지합니다.")).toBeInTheDocument()
  );
});

test("종목을 삭제할 수 있다", async () => {
  mockQuoteOnce({ ticker: "102110", name: "TIGER 200", price: 50_000 });
  render(<HoldingsPanel />);

  fireEvent.change(screen.getByLabelText("종목코드"), { target: { value: "102110" } });
  fireEvent.click(screen.getByRole("button", { name: "추가" }));
  await screen.findByText(/TIGER 200/);

  fireEvent.click(screen.getByRole("button", { name: "TIGER 200 삭제" }));

  expect(screen.queryByText(/TIGER 200/)).not.toBeInTheDocument();
  expect(screen.getByText("아직 등록한 종목이 없습니다. 위에서 종목코드를 입력해 추가하세요.")).toBeInTheDocument();
});

test("새로고침해도 등록한 종목과 수량이 그대로 남는다", async () => {
  mockQuoteOnce({ ticker: "102110", name: "TIGER 200", price: 50_000 });
  const { unmount } = render(<HoldingsPanel />);

  fireEvent.change(screen.getByLabelText("종목코드"), { target: { value: "102110" } });
  fireEvent.click(screen.getByRole("button", { name: "추가" }));
  await screen.findByText(/TIGER 200/);
  fireEvent.change(screen.getByLabelText("수량"), { target: { value: "3" } });

  unmount();
  render(<HoldingsPanel />);

  expect(await screen.findByText(/TIGER 200/)).toBeInTheDocument();
  expect(screen.getByLabelText("수량")).toHaveValue("3");
});
