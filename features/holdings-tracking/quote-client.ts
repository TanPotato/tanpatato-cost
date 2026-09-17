export type Quote = { name: string; price: number };

/**
 * 이 앱의 서버 라우트(app/api/quote/[ticker])를 거쳐 종가를 가져온다. 실패는
 * 예외로 던지지 않고 null로 돌려줘서, 호출하는 쪽이 매번 try/catch를 두지
 * 않아도 되게 한다.
 */
export async function fetchQuote(ticker: string): Promise<Quote | null> {
  try {
    const res = await fetch(`/api/quote/${ticker}`);
    if (!res.ok) return null;

    const data = (await res.json()) as { name?: string; price?: number };
    if (!data.name || typeof data.price !== "number") return null;

    return { name: data.name, price: data.price };
  } catch {
    return null;
  }
}
