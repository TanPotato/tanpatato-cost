import { describe, expect, test } from "vitest";

import { digitsOnly, formatHorizon, formatNumber, formatPercent, formatWon, withRo } from "./format";

describe("formatNumber / formatWon", () => {
  test("천 단위 구분과 원 단위를 붙인다", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
    expect(formatWon(1234567)).toBe("1,234,567원");
  });

  test("소수점은 반올림한다", () => {
    expect(formatNumber(1000.6)).toBe("1,001");
  });
});

describe("formatPercent", () => {
  test("0~1 비율을 소수 첫째 자리 백분율로 바꾼다", () => {
    expect(formatPercent(0.438)).toBe("43.8%");
  });
});

describe("digitsOnly", () => {
  test("숫자가 아닌 문자를 모두 지운다", () => {
    expect(digitsOnly("1,234,567원")).toBe("1234567");
  });
});

describe("withRo", () => {
  test("받침이 없으면 로를 고른다", () => {
    expect(withRo("차량 교체")).toBe("로");
  });

  test("받침이 있으면 으로를 고른다", () => {
    expect(withRo("대학 등록금")).toBe("으로");
  });

  test("받침이 ㄹ이면 로를 고른다", () => {
    expect(withRo("자동차 보험료 환급")).toBe("으로");
    expect(withRo("생활")).toBe("로");
  });
});

describe("formatHorizon", () => {
  test("가장 긴 선택지에 도달하면 이상으로 표기한다", () => {
    expect(formatHorizon(7, 20)).toBe("7년");
    expect(formatHorizon(20, 20)).toBe("20년 이상");
  });
});
