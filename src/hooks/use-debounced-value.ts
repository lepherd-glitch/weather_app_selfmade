'use client';

import { useEffect, useState } from 'react';

/**
 * 값이 `delayMs` 동안 변하지 않을 때까지 갱신을 미룬다.
 *
 * 지역 검색 자동완성에서 타이핑마다 API를 호출하면 무료 플랜의 분당 60회 한도를
 * 순식간에 소진한다. 입력이 멎은 뒤에만 조회하도록 이 훅으로 걸러낸다.
 */
export function useDebouncedValue<TValue>(value: TValue, delayMs: number): TValue {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);

    // 값이 다시 바뀌면 이전 타이머를 버려 마지막 입력만 살아남게 한다.
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
