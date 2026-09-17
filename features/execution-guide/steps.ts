import type { PurchaseTarget, Step, StepId } from "./types";

const ZERO_AMOUNT_NOTICE = "먼저 지출을 손봐 매달 남는 돈을 만들어 주세요.";

const CATEGORY_TO_STEP_ID: Record<PurchaseTarget["category"], StepId> = {
  "domestic-equity": "buy-domestic-equity",
  "overseas-equity": "buy-overseas-equity",
  bond: "buy-bond",
};

const PREP_STEPS: { id: StepId; title: string; description: string }[] = [
  {
    id: "install-app",
    title: "미래에셋증권 M-STOCK 설치하기",
    description: "앱스토어나 플레이스토어에서 'M-STOCK'을 검색해 설치합니다.",
  },
  {
    id: "open-account",
    title: "계좌 개설하기",
    description: "M-STOCK 앱에서 메뉴 > 서비스 > 계좌개설 순서로 들어가 비대면으로 개설합니다.",
  },
  {
    id: "transfer-funds",
    title: "투자할 돈 이체하기",
    description: "개설한 계좌로 투자에 쓸 돈을 이체합니다.",
  },
];

/**
 * 실행 안내의 여섯 단계를 만든다. 준비 세 단계는 금액과 무관하게 항상 체크할
 * 수 있고, 매수 세 단계는 targets에서 받은 금액을 그대로 담는다. 세 종목
 * 금액이 모두 0원이면 "0원어치 매수"라는 실행 불가능한 지시 대신 안내 문구로
 * 바꾸고 체크할 수 없게 한다.
 */
export function buildSteps(targets: PurchaseTarget[]): Step[] {
  const allZero = targets.every((target) => target.amount === 0);

  const prepSteps: Step[] = PREP_STEPS.map((step) => ({ ...step, checkable: true }));

  const buySteps: Step[] = targets.map((target) => ({
    id: CATEGORY_TO_STEP_ID[target.category],
    title: `${target.name} 매수하기`,
    description: allZero
      ? ZERO_AMOUNT_NOTICE
      : `M-STOCK에서 ${target.name}(을)를 검색해 ${target.amount.toLocaleString("ko-KR")}원만큼 매수합니다.`,
    checkable: !allZero,
    amount: target.amount,
  }));

  return [...prepSteps, ...buySteps];
}
