/**
 * 선택된 지역을 URL 검색 파라미터로 주고받는 계층.
 *
 * 지역 상태를 URL에 두면 Server Component가 서버에서 바로 날씨를 조회할 수 있어
 * API 키가 브라우저로 나가지 않고, 전역 상태 라이브러리도 필요 없다.
 * 부수적으로 특정 지역 날씨 URL을 공유·북마크할 수 있다.
 */

import { DEFAULT_LOCATION } from '@/lib/weather-errors';
import type { WeatherLocation } from '@/types/weather';

/** Next.js `page`의 `searchParams`가 넘겨주는 형태. */
type SearchParams = Record<string, string | string[] | undefined>;

/** 지역명 표시 길이 상한. URL로 들어온 과도하게 긴 문자열이 UI를 망치지 않게 한다. */
const MAX_NAME_LENGTH = 80;

/** 값이 배열로 들어오면(같은 키 중복) 첫 번째만 쓴다. */
function readParam(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

/** 유한한 숫자이고 주어진 범위 안인지 확인한다. */
function parseCoordinate(raw: string | undefined, limit: number): number | null {
  if (raw === undefined || raw.trim() === '') return null;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || Math.abs(parsed) > limit) return null;

  return parsed;
}

/**
 * URL 파라미터에서 선택된 지역을 복원한다.
 *
 * 좌표는 그대로 OpenWeatherMap 요청에 실리므로 반드시 검증한다.
 * 하나라도 유효하지 않으면 기본 지역으로 되돌려, 조작된 URL로 진입해도
 * 오류 화면 대신 정상적인 기본 화면을 보여준다.
 */
export function parseLocationParams(params: SearchParams): WeatherLocation {
  const latitude = parseCoordinate(readParam(params, 'lat'), 90);
  const longitude = parseCoordinate(readParam(params, 'lon'), 180);

  if (latitude === null || longitude === null) {
    return DEFAULT_LOCATION;
  }

  const name = readParam(params, 'name')?.trim().slice(0, MAX_NAME_LENGTH);
  const countryCode = readParam(params, 'country')?.trim().slice(0, 2).toUpperCase();

  return {
    name: name || '선택한 지역',
    countryCode: countryCode ?? '',
    latitude,
    longitude,
  };
}

/** 지역을 가리키는 링크 경로를 만든다. */
export function buildLocationHref(location: WeatherLocation): string {
  const params = new URLSearchParams({
    name: location.name,
    country: location.countryCode,
    lat: String(location.latitude),
    lon: String(location.longitude),
  });

  return `/?${params.toString()}`;
}
