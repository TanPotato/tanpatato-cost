const TICKER_PATTERN = /^\d{6}$/;

/**
 * 네이버 증권 모바일 API로 종가를 가져온다. 브라우저에서 직접 부르면 Origin
 * 헤더 때문에 403이 떨어져(docs/decisions/quote-source.md) 이 라우트가 대신
 * 호출한다. 인증키가 필요 없는 대신 공식 문서가 없는 비공개 엔드포인트라,
 * 응답 모양이 달라지면 이 라우트가 가장 먼저 깨진다.
 */
function naverQuoteUrl(ticker: string): string {
  return `https://m.stock.naver.com/api/stock/${ticker}/basic`;
}

type NaverBasicResponse = {
  stockName?: string;
  closePrice?: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
): Promise<Response> {
  const { ticker } = await params;

  if (!TICKER_PATTERN.test(ticker)) {
    return Response.json({ error: "종목코드는 6자리 숫자여야 합니다." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(naverQuoteUrl(ticker), {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
  } catch {
    return Response.json({ error: "종가 조회에 실패했습니다." }, { status: 502 });
  }

  if (!upstream.ok) {
    return Response.json({ error: "종가 조회에 실패했습니다." }, { status: 502 });
  }

  const data = (await upstream.json()) as NaverBasicResponse;
  const price = Number((data.closePrice ?? "").replace(/,/g, ""));

  if (!data.stockName || !Number.isFinite(price) || price <= 0) {
    return Response.json({ error: "존재하지 않는 종목코드입니다." }, { status: 404 });
  }

  return Response.json({ ticker, name: data.stockName, price });
}
