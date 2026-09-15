/**
 * 도시 현지 시각 기준 한국어 날짜·시간 포맷터.
 *
 * OpenWeather의 타임스탬프는 UTC이고, 지역별 오프셋은 응답의 `timezone` 필드로 따로 온다.
 * 이를 `toZonedDate`로 옮긴 뒤 `timeZone: 'UTC'`로 포맷하면, 서버(예: UTC)와
 * 브라우저(예: KST)의 로컬 타임존에 관계없이 항상 해당 도시의 시각이 나온다.
 * `date-fns`의 `format`은 실행 환경의 로컬 게터를 쓰기 때문에 이 용도에는 맞지 않는다.
 */

import { toZonedDate } from '@/lib/weather-transform';

const LOCALE = 'ko-KR';

/** 포맷터 생성은 비용이 있어 모듈 수준에서 한 번만 만든다. */
const fullDateFormatter = new Intl.DateTimeFormat(LOCALE, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
  timeZone: 'UTC',
});

const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'UTC',
});

/** `hourCycle: 'h23'`이 없으면 `오후 2시`가 되어 예보 카드가 넓어진다. */
const hourFormatter = new Intl.DateTimeFormat(LOCALE, {
  hour: 'numeric',
  hourCycle: 'h23',
  timeZone: 'UTC',
});

const weekdayFormatter = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'long',
  timeZone: 'UTC',
});

const monthDayFormatter = new Intl.DateTimeFormat(LOCALE, {
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

/** `2026년 9월 15일 화요일` 형태로 포맷한다. */
export function formatZonedFullDate(unixSeconds: number, timezoneOffsetSeconds: number): string {
  return fullDateFormatter.format(toZonedDate(unixSeconds, timezoneOffsetSeconds));
}

/** `오후 1:58` 형태로 포맷한다. */
export function formatZonedTime(unixSeconds: number, timezoneOffsetSeconds: number): string {
  return timeFormatter.format(toZonedDate(unixSeconds, timezoneOffsetSeconds));
}

/** `14시` 형태로 포맷한다. 시간별 예보 카드에 쓴다. */
export function formatZonedHour(unixSeconds: number, timezoneOffsetSeconds: number): string {
  return hourFormatter.format(toZonedDate(unixSeconds, timezoneOffsetSeconds));
}

/** `화요일` 형태로 포맷한다. 일별 예보 행에 쓴다. */
export function formatZonedWeekday(unixSeconds: number, timezoneOffsetSeconds: number): string {
  return weekdayFormatter.format(toZonedDate(unixSeconds, timezoneOffsetSeconds));
}

/** `9월 15일` 형태로 포맷한다. */
export function formatZonedMonthDay(unixSeconds: number, timezoneOffsetSeconds: number): string {
  return monthDayFormatter.format(toZonedDate(unixSeconds, timezoneOffsetSeconds));
}
