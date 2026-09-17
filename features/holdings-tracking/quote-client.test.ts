import { afterEach, describe, expect, test, vi } from "vitest";

import { fetchQuote } from "./quote-client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchQuote", () => {
  test("성공하면 종목명과 종가를 돌려준다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ticker: "102110", name: "TIGER 200", price: 26520 }), {
          status: 200,
        })
      )
    );

    const result = await fetchQuote("102110");
    expect(result).toEqual({ name: "TIGER 200", price: 26520 });
  });

  test("서버가 오류를 내면 null을 돌려준다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "not found" }), { status: 404 }))
    );

    expect(await fetchQuote("999999")).toBeNull();
  });

  test("네트워크 자체가 끊겨도 null을 돌려준다(예외를 던지지 않는다)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    expect(await fetchQuote("102110")).toBeNull();
  });
});
