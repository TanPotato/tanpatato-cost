import { beforeEach, describe, expect, test } from "vitest";

import { createBackup, parseBackup, restoreBackup } from "./bundle";
import { loadRecord, saveRecord, startingRecord } from "@/features/finance-record";
import { loadCheckedSteps, saveCheckedSteps } from "@/features/execution-guide";
import { loadHoldings, saveHoldings } from "@/features/holdings-tracking";

beforeEach(() => {
  window.localStorage.clear();
});

describe("createBackup", () => {
  test("아무것도 기록하지 않은 처음 상태에서도 만들어진다", () => {
    const backup = createBackup();

    expect(backup.version).toBe(1);
    expect(backup.financeRecord.incomes.length).toBeGreaterThan(0); // startingRecord 기본 항목
    expect(backup.executionGuideChecked).toEqual([]);
    expect(backup.holdings).toEqual([]);
    expect(typeof backup.exportedAt).toBe("string");
  });

  test("저장된 값을 그대로 담는다", () => {
    const record = { ...startingRecord(), incomes: [] };
    saveRecord(record);
    saveCheckedSteps(["install-app"]);
    saveHoldings([
      {
        id: "h-1",
        ticker: "102110",
        name: "TIGER 200",
        quantity: 10,
        avgBuyPrice: 50_000,
        lastPrice: 55_000,
        lastPriceAt: "2026-09-17T00:00:00.000Z",
      },
    ]);

    const backup = createBackup();

    expect(backup.financeRecord.incomes).toEqual([]);
    expect(backup.executionGuideChecked).toEqual(["install-app"]);
    expect(backup.holdings).toHaveLength(1);
    expect(backup.holdings[0].ticker).toBe("102110");
  });
});

describe("parseBackup", () => {
  test("올바른 백업 파일 내용을 그대로 돌려준다", () => {
    const backup = createBackup();
    const parsed = parseBackup(JSON.stringify(backup));

    expect(parsed).toEqual(backup);
  });

  test("JSON이 아니면 null을 돌려준다", () => {
    expect(parseBackup("이건 JSON이 아니다")).toBeNull();
  });

  test("이 앱의 백업 파일이 아니면(필요한 자리가 없으면) null을 돌려준다", () => {
    expect(parseBackup(JSON.stringify({ hello: "world" }))).toBeNull();
    expect(parseBackup(JSON.stringify({ version: 1, financeRecord: {} }))).toBeNull();
  });

  test("executionGuideChecked나 holdings가 배열이 아니면 null을 돌려준다", () => {
    const backup = createBackup();
    expect(
      parseBackup(JSON.stringify({ ...backup, executionGuideChecked: "install-app" }))
    ).toBeNull();
    expect(parseBackup(JSON.stringify({ ...backup, holdings: {} }))).toBeNull();
  });
});

describe("restoreBackup", () => {
  test("파일 내용으로 세 모듈의 저장값을 전부 교체한다", () => {
    saveCheckedSteps(["install-app", "open-account"]);
    saveHoldings([
      {
        id: "old",
        ticker: "999999",
        name: "old",
        quantity: 1,
        avgBuyPrice: 1,
        lastPrice: 1,
        lastPriceAt: null,
      },
    ]);

    const backup = {
      version: 1 as const,
      exportedAt: "2026-09-17T00:00:00.000Z",
      financeRecord: { ...startingRecord(), incomes: [] },
      executionGuideChecked: [],
      holdings: [],
    };

    restoreBackup(backup);

    expect(loadRecord()?.incomes).toEqual([]);
    expect(loadCheckedSteps()).toEqual([]);
    expect(loadHoldings()).toEqual([]);
  });
});
