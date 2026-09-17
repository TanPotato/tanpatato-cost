import type { StepId } from "@/features/execution-guide";
import type { FinanceRecord } from "@/features/finance-record";
import type { Holding } from "@/features/holdings-tracking";

/**
 * 세 모듈의 저장값을 그대로 담는다. 이 모듈은 각 모듈의 데이터 모양을 새로
 * 검증하지 않는다 — 불러온 뒤에는 각 모듈이 이미 가진 버전 호환 로직을 그대로
 * 탄다(예: finance-record의 reconcile).
 */
export type BackupBundle = {
  /** 이 백업 포맷 자체의 버전. 각 모듈 내부 버전과는 별개다. */
  version: 1;
  exportedAt: string;
  financeRecord: FinanceRecord;
  executionGuideChecked: StepId[];
  holdings: Holding[];
};
