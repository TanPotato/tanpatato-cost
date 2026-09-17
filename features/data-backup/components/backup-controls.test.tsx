import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";

import { BackupControls } from "./backup-controls";
import { saveRecord, startingRecord } from "@/features/finance-record";
import { loadCheckedSteps, saveCheckedSteps } from "@/features/execution-guide";

beforeEach(() => {
  window.localStorage.clear();
});

function uploadFile(input: HTMLElement, content: string, name = "backup.json") {
  const file = new File([content], name, { type: "application/json" });
  fireEvent.change(input, { target: { files: [file] } });
}

test("내보내기를 누르면 다운로드가 트리거된다", () => {
  const clickSpy = vi.fn();
  const originalCreateElement = document.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
    const el = originalCreateElement(tag);
    if (tag === "a") el.click = clickSpy;
    return el;
  });
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

  render(<BackupControls />);
  fireEvent.click(screen.getByRole("button", { name: "내보내기" }));

  expect(clickSpy).toHaveBeenCalledTimes(1);
  vi.restoreAllMocks();
});

test("이 앱의 백업 파일이 아니면 오류를 보여주고 아무것도 바꾸지 않는다", async () => {
  saveCheckedSteps(["install-app"]);
  render(<BackupControls />);

  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  uploadFile(input, JSON.stringify({ hello: "world" }));

  expect(
    await screen.findByText("이 앱이 만든 백업 파일이 아니거나 손상된 파일입니다.")
  ).toBeInTheDocument();
  expect(loadCheckedSteps()).toEqual(["install-app"]);
});

test("올바른 백업 파일을 고르면 교체를 확인하는 절차가 나오고, 확인하면 저장값이 바뀐다", async () => {
  saveRecord({ ...startingRecord(), incomes: [] });
  saveCheckedSteps(["install-app"]);

  const backup = {
    version: 1,
    exportedAt: "2026-09-17T00:00:00.000Z",
    financeRecord: startingRecord(),
    executionGuideChecked: ["open-account"],
    holdings: [],
  };

  render(<BackupControls />);
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  uploadFile(input, JSON.stringify(backup));

  expect(
    await screen.findByText("지금 기록을 파일 내용으로 바꿀까요?")
  ).toBeInTheDocument();

  const reloadSpy = vi.fn();
  Object.defineProperty(window, "location", {
    value: { ...window.location, reload: reloadSpy },
    writable: true,
  });

  fireEvent.click(screen.getByRole("button", { name: "바꾸기" }));

  await waitFor(() => expect(loadCheckedSteps()).toEqual(["open-account"]));
  expect(reloadSpy).toHaveBeenCalledTimes(1);
});

test("확인 절차에서 취소하면 저장값이 그대로 남는다", async () => {
  saveCheckedSteps(["install-app"]);

  const backup = {
    version: 1,
    exportedAt: "2026-09-17T00:00:00.000Z",
    financeRecord: startingRecord(),
    executionGuideChecked: ["open-account"],
    holdings: [],
  };

  render(<BackupControls />);
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  uploadFile(input, JSON.stringify(backup));
  await screen.findByText("지금 기록을 파일 내용으로 바꿀까요?");

  fireEvent.click(screen.getByRole("button", { name: "취소" }));

  await waitFor(() =>
    expect(screen.queryByText("지금 기록을 파일 내용으로 바꿀까요?")).not.toBeInTheDocument()
  );
  expect(loadCheckedSteps()).toEqual(["install-app"]);
});
