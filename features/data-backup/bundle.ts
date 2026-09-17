import { loadCheckedSteps, saveCheckedSteps } from "@/features/execution-guide";
import { loadRecord, saveRecord, startingRecord } from "@/features/finance-record";
import { loadHoldings, saveHoldings } from "@/features/holdings-tracking";

import type { BackupBundle } from "./types";

const BACKUP_VERSION = 1;

/**
 * 그 시점 세 모듈의 저장값을 그대로 담는다. 아무것도 기록하지 않았어도
 * 화면에 보이는 것과 같은 기본 상태(startingRecord)로 채운다 — 화면이
 * loadRecord() ?? startingRecord()로 첫 상태를 정하는 것과 같은 규칙이다.
 */
export function createBackup(): BackupBundle {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    financeRecord: loadRecord() ?? startingRecord(),
    executionGuideChecked: loadCheckedSteps(),
    holdings: loadHoldings(),
  };
}

/**
 * 백업 파일 후보를 최소한으로만 확인한다. 세 모듈의 데이터 모양 자체는
 * 검증하지 않는다 — restoreBackup 이후 각 모듈이 자기 저장값을 읽을 때
 * 이미 가진 버전 호환 로직이 그 일을 한다.
 */
export function parseBackup(raw: string): BackupBundle | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof data !== "object" || data === null) return null;
  const candidate = data as Record<string, unknown>;

  const hasRequiredShape =
    "version" in candidate &&
    "financeRecord" in candidate &&
    Array.isArray(candidate.executionGuideChecked) &&
    Array.isArray(candidate.holdings);

  return hasRequiredShape ? (candidate as unknown as BackupBundle) : null;
}

/** 파일 내용으로 세 모듈의 저장값을 전부 교체한다. 항목 단위로 합치지 않는다. */
export function restoreBackup(bundle: BackupBundle): void {
  saveRecord(bundle.financeRecord);
  saveCheckedSteps(bundle.executionGuideChecked);
  saveHoldings(bundle.holdings);
}
