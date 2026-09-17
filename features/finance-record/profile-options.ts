import type { DependentKey, RiskLevel } from "./types";

/** 부양가족 선택지. 화면과 진단이 같은 순서와 같은 이름을 쓴다. */
export const DEPENDENT_CHOICES: { value: DependentKey; label: string }[] = [
  { value: "spouse", label: "배우자" },
  { value: "child-1", label: "자녀 1명" },
  { value: "child-2", label: "자녀 2명" },
  { value: "child-3plus", label: "자녀 3명 이상" },
  { value: "parents", label: "부모님" },
];

const CHILD_KEYS: DependentKey[] = ["child-1", "child-2", "child-3plus"];

/**
 * 자녀 인원은 셋 중 하나만 설 수 있다. 새로 고른 인원이 앞서 고른 인원을 밀어낸다.
 * 고른 순서와 상관없이 표시 순서는 선택지 순서로 맞춘다.
 */
export function normalizeDependents(
  previous: DependentKey[],
  next: DependentKey[]
): DependentKey[] {
  const addedChild = next.find(
    (key) => CHILD_KEYS.includes(key) && !previous.includes(key)
  );
  const kept = addedChild
    ? next.filter((key) => !CHILD_KEYS.includes(key) || key === addedChild)
    : next;

  return DEPENDENT_CHOICES.filter((choice) => kept.includes(choice.value)).map(
    (choice) => choice.value
  );
}

export function describeDependents(dependents: DependentKey[]): string {
  const labels = DEPENDENT_CHOICES.filter((choice) =>
    dependents.includes(choice.value)
  ).map((choice) => choice.label);

  return labels.length > 0 ? labels.join(", ") : "없음";
}

export const RISK_CHOICES: {
  value: RiskLevel;
  name: string;
  description: string;
}[] = [
  { value: 1, name: "안정형", description: "원금이 줄어드는 것은 못 견딥니다" },
  { value: 2, name: "안정추구형", description: "5% 정도까지는 버팁니다" },
  { value: 3, name: "중립형", description: "15% 정도까지는 버팁니다" },
  { value: 4, name: "적극형", description: "30% 정도까지는 버팁니다" },
  { value: 5, name: "공격형", description: "반토막이 나도 기다립니다" },
];

export function describeRisk(level: RiskLevel): string {
  const choice = RISK_CHOICES.find((item) => item.value === level);
  return choice ? `${choice.value}단계 ${choice.name}` : "미입력";
}
