import type { DependentKey, RiskLevel } from "./types";

/** 부양가족 선택지. 화면과 진단이 같은 순서와 같은 이름을 쓴다. */
export const DEPENDENT_CHOICES: { value: DependentKey; label: string }[] = [
  { value: "spouse", label: "배우자" },
  { value: "child-1", label: "자녀 1명" },
  { value: "child-2", label: "자녀 2명" },
  { value: "child-3plus", label: "자녀 3명 이상" },
  { value: "parent-1", label: "부모님 1명" },
  { value: "parent-2", label: "부모님 2명" },
];

/**
 * 인원을 나타내는 선택지 묶음. 자녀는 한 분만 부양하는지 두 분, 세 분 이상인지에
 * 따라 부담 규모가 다르고, 부모님도 한 분과 두 분이 다르다. 그래서 "자녀"나
 * "부모님" 하나로 뭉치지 않고 인원별로 나눈 뒤, 같은 묶음 안에서는 하나만
 * 고를 수 있게 한다.
 */
const COUNT_GROUPS: DependentKey[][] = [
  ["child-1", "child-2", "child-3plus"],
  ["parent-1", "parent-2"],
];

function groupOf(key: DependentKey): DependentKey[] | undefined {
  return COUNT_GROUPS.find((group) => group.includes(key));
}

/**
 * 같은 묶음에서 새로 고른 인원이 앞서 고른 인원을 밀어낸다.
 * 고른 순서와 상관없이 표시 순서는 선택지 순서로 맞춘다.
 */
export function normalizeDependents(
  previous: DependentKey[],
  next: DependentKey[]
): DependentKey[] {
  const addedKey = next.find((key) => !previous.includes(key));
  const addedGroup = addedKey ? groupOf(addedKey) : undefined;
  const kept = addedGroup
    ? next.filter((key) => !addedGroup.includes(key) || key === addedKey)
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
