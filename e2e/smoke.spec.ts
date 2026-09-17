import { expect, test } from "@playwright/test";

test("첫 화면에서 금액을 적으면 매달 남는 돈이 바로 보인다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("은퇴 대비 자산관리 Agent");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "매달 들어오고 나가는 돈"
  );

  const amounts = page.getByLabel("금액");
  await amounts.nth(0).fill("5000000");
  await amounts.nth(1).fill("1200000");

  const strip = page.getByText("매달 남는 돈").locator("..");
  await expect(strip).toContainText("3,800,000원");
});

test("아무것도 적지 않으면 진단 대신 기록하러 가라고 안내한다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "진단" }).click();

  await expect(page.getByText("아직 진단할 것이 없습니다")).toBeVisible();

  await page.getByRole("button", { name: "수입·지출 기록하러 가기" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "매달 들어오고 나가는 돈"
  );
});
