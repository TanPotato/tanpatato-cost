import { afterEach, describe, expect, test, vi } from "vitest";

import { GET } from "./route";

function ctx(ticker: string) {
  return { params: Promise.resolve({ ticker }) };
}

function req(url = "http://localhost/api/quote/069500") {
  return new Request(url);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GET /api/quote/[ticker]", () => {
  test("6자리가 아닌 종목코드는 조회하지 않고 400을 낸다", async () => {
    const res = await GET(req(), ctx("abc"));
    expect(res.status).toBe(400);
  });

  test("네이버 응답에서 종목명과 종가를 뽑아 낸다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ stockName: "TIGER 200", closePrice: "26,520" }),
          { status: 200 }
        )
      )
    );

    const res = await GET(req(), ctx("102110"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ticker: "102110", name: "TIGER 200", price: 26520 });
  });

  test("네이버가 종목명을 못 찾으면(빈 stockName) 404를 낸다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ stockName: "", closePrice: "" }), { status: 200 })
      )
    );

    const res = await GET(req(), ctx("999999"));
    expect(res.status).toBe(404);
  });

  test("네이버 호출 자체가 실패하면 502를 낸다", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const res = await GET(req(), ctx("069500"));
    expect(res.status).toBe(502);
  });
});
