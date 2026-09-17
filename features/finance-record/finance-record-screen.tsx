"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { summarize } from "./calculate";
import { BalancePanel } from "./components/balance-panel";
import { CashflowPanel } from "./components/cashflow-panel";
import { DiagnosisPanel } from "./components/diagnosis-panel";
import { ProfilePanel } from "./components/profile-panel";
import { SummaryStrip } from "./components/summary-strip";
import { diagnose } from "./diagnose";
import { formatWon } from "./format";
import { startingRecord } from "./seed";
import { loadRecord, saveRecord } from "./storage";
import type { FinanceRecord, Profile } from "./types";

type TabKey = "cashflow" | "balance" | "profile" | "diagnosis";

const TABS: { value: TabKey; label: string; accent: string }[] = [
  // TabsTrigger가 다크에서 자기 배경과 글자색을 따로 잡으므로 dark: 짝을 함께 준다.
  {
    value: "cashflow",
    label: "수입·지출",
    accent:
      "hover:text-sec-1 data-active:bg-sec-1-soft data-active:text-sec-1 dark:data-active:bg-sec-1-soft dark:data-active:text-sec-1",
  },
  {
    value: "balance",
    label: "자산·부채",
    accent:
      "hover:text-sec-2 data-active:bg-sec-2-soft data-active:text-sec-2 dark:data-active:bg-sec-2-soft dark:data-active:text-sec-2",
  },
  {
    value: "profile",
    label: "내 상황",
    accent:
      "hover:text-sec-3 data-active:bg-sec-3-soft data-active:text-sec-3 dark:data-active:bg-sec-3-soft dark:data-active:text-sec-3",
  },
  {
    value: "diagnosis",
    label: "진단",
    accent:
      "hover:text-sec-4 data-active:bg-sec-4-soft data-active:text-sec-4 dark:data-active:bg-sec-4-soft dark:data-active:text-sec-4",
  },
];

const HEADINGS: Record<TabKey, { title: string; lede: string }> = {
  cashflow: {
    title: "매달 들어오고 나가는 돈",
    lede: "항목마다 주기를 고를 수 있습니다. 자동차 보험료나 재산세처럼 1년에 한두 번 나가는 돈도 그대로 적으면 월 기준으로 환산해 계산합니다.",
  },
  balance: {
    title: "이미 쌓여 있는 돈과 갚아야 할 돈",
    lede: "비워 두어도 진단은 나옵니다. 적으면 순자산까지 함께 보여 드립니다.",
  },
  profile: {
    title: "내 상황과 투자 성향",
    lede: "같은 금액이라도 은퇴까지 남은 기간과 돈이 필요한 시점에 따라 맞는 투자가 달라집니다.",
  },
  diagnosis: {
    title: "지금 내 상태",
    lede: "주기가 다른 항목을 모두 월 기준으로 환산해 계산했습니다.",
  },
};

export function FinanceRecordScreen() {
  // 이 화면은 브라우저에서만 그려지므로 첫 렌더에서 곧바로 지난 기록을 읽는다.
  const [record, setRecord] = useState<FinanceRecord>(() => loadRecord() ?? startingRecord());
  const [tab, setTab] = useState<TabKey>("cashflow");

  useEffect(() => {
    saveRecord(record);
  }, [record]);

  const summary = useMemo(() => summarize(record), [record]);
  const diagnosis = useMemo(() => diagnose(record, summary), [record, summary]);

  function patch(next: Partial<FinanceRecord>) {
    setRecord((current) => ({ ...current, ...next }));
  }

  function patchProfile(next: Partial<Profile>) {
    setRecord((current) => ({ ...current, profile: { ...current.profile, ...next } }));
  }

  // 진단할 것이 없을 때는 "환산해 계산했습니다"가 거짓말이 되므로 제목째로 비운다.
  const heading = tab === "diagnosis" && summary.isBlank ? null : HEADINGS[tab];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6">
      <header className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">은퇴 대비 자산관리 Agent</p>
        <Tabs value={tab} onValueChange={(value) => setTab(value as TabKey)}>
          <TabsList className="h-auto w-full">
            {TABS.map((item) => (
              <TabsTrigger
                key={item.value}
                className={cn("flex-1", item.accent)}
                value={item.value}
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </header>

      {heading ? (
        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {heading.title}
          </h1>
          <p className="max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
            {heading.lede}
          </p>
        </div>
      ) : null}

      {tab === "cashflow" ? (
        <>
          <SummaryStrip
            cells={[
              { label: "월 수입", value: formatWon(summary.monthlyIncome) },
              { label: "월 지출", value: formatWon(summary.monthlyExpense) },
              {
                label: "매달 남는 돈",
                value: formatWon(summary.monthlySurplus),
                negative: summary.monthlySurplus < 0,
              },
            ]}
          />
          <CashflowPanel
            expenses={record.expenses}
            incomes={record.incomes}
            monthlyExpense={summary.monthlyExpense}
            monthlyIncome={summary.monthlyIncome}
            onExpensesChange={(expenses) => patch({ expenses })}
            onIncomesChange={(incomes) => patch({ incomes })}
          />
          <FooterActions
            next={{ label: "자산·부채 기록하기", onClick: () => setTab("balance") }}
            reset={() => setRecord(startingRecord())}
          />
        </>
      ) : null}

      {tab === "balance" ? (
        <>
          <SummaryStrip
            cells={[
              { label: "자산 합계", value: formatWon(summary.assetTotal) },
              { label: "부채 합계", value: formatWon(summary.debtTotal) },
              {
                label: "순자산",
                value: formatWon(summary.netWorth),
                negative: summary.netWorth < 0,
              },
            ]}
          />
          <BalancePanel
            assetTotal={summary.assetTotal}
            assets={record.assets}
            debtTotal={summary.debtTotal}
            debts={record.debts}
            onAssetsChange={(assets) => patch({ assets })}
            onDebtsChange={(debts) => patch({ debts })}
          />
          <FooterActions
            back={{ label: "수입·지출로 돌아가기", onClick: () => setTab("cashflow") }}
            next={{ label: "내 상황 입력하기", onClick: () => setTab("profile") }}
          />
        </>
      ) : null}

      {tab === "profile" ? (
        <>
          <ProfilePanel profile={record.profile} onChange={patchProfile} />
          <FooterActions
            back={{ label: "자산·부채로 돌아가기", onClick: () => setTab("balance") }}
            next={{ label: "진단 보기", onClick: () => setTab("diagnosis") }}
          />
        </>
      ) : null}

      {tab === "diagnosis" ? (
        <DiagnosisPanel
          diagnosis={diagnosis}
          record={record}
          summary={summary}
          onGoToRecord={() => setTab("cashflow")}
        />
      ) : null}
    </div>
  );
}

function FooterActions({
  back,
  next,
  reset,
}: {
  back?: { label: string; onClick: () => void };
  next: { label: string; onClick: () => void };
  reset?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 pb-6">
      {back ? (
        <Button type="button" variant="outline" onClick={back.onClick}>
          {back.label}
        </Button>
      ) : null}
      {reset ? (
        <Button type="button" variant="outline" onClick={reset}>
          전부 지우고 다시 시작
        </Button>
      ) : null}
      <span className="flex-1" />
      <Button type="button" onClick={next.onClick}>
        {next.label}
      </Button>
    </div>
  );
}
