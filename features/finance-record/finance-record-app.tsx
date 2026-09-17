"use client";

import dynamic from "next/dynamic";

/**
 * 기록은 쓰는 사람의 브라우저에만 있다. 서버에서 한 번 그린 뒤 다시 맞추면
 * 빈 화면이 잠깐 스쳤다가 바뀌므로, 처음부터 브라우저에서만 그린다.
 */
const Screen = dynamic(
  () => import("./finance-record-screen").then((module) => module.FinanceRecordScreen),
  { ssr: false }
);

export function FinanceRecordApp() {
  return <Screen />;
}
