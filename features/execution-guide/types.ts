export type StepId =
  | "install-app"
  | "open-account"
  | "transfer-funds"
  | "buy-domestic-equity"
  | "buy-overseas-equity"
  | "buy-bond";

export type Step = {
  id: StepId;
  title: string;
  description: string;
  /**
   * 이 단계에 체크박스가 있는지. 매수 단계인데 투자할 금액이 0원이면
   * false다. "0원어치 매수"는 실행할 수 없는 지시라 체크 대신 안내
   * 문구로 대체한다.
   */
  checkable: boolean;
  /** 매수 단계에만 있다. */
  amount?: number;
};

/**
 * 실행 안내가 받는 입력. finance-record와 portfolio-recommendation을
 * 몰라야 하므로, 필요한 값만 옮겨 담아 받는다.
 */
export type PurchaseTarget = {
  category: "domestic-equity" | "overseas-equity" | "bond";
  name: string;
  amount: number;
};
