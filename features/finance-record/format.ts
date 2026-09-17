export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("ko-KR");
}

export function formatWon(value: number): string {
  return `${formatNumber(value)}원`;
}

export function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}

/** 입력 중인 금액에서 숫자만 남긴다. */
export function digitsOnly(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
const JONGSEONG_COUNT = 28;
const JONGSEONG_RIEUL = 8;

/** 앞 단어의 받침에 따라 "로"와 "으로"를 고른다. */
export function withRo(word: string): string {
  const last = word.trim().slice(-1);
  if (!last) return "로";

  const code = last.charCodeAt(0);
  if (code < HANGUL_START || code > HANGUL_END) return "로";

  const jongseong = (code - HANGUL_START) % JONGSEONG_COUNT;
  return jongseong === 0 || jongseong === JONGSEONG_RIEUL ? "로" : "으로";
}

/** 투자금을 묶어 둘 수 있는 기간. 가장 긴 선택지는 그 이상을 뜻한다. */
export function formatHorizon(years: number, longest: number): string {
  return years >= longest ? `${longest}년 이상` : `${years}년`;
}
