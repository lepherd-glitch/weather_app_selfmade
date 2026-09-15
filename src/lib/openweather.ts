import 'server-only';

/**
 * OpenWeatherMap API 클라이언트.
 *
 * `server-only`를 import하므로 이 모듈을 클라이언트 컴포넌트에서 참조하면 빌드가 실패한다.
 * API 키가 브라우저 번들에 섞이는 사고를 런타임이 아니라 빌드 시점에 잡기 위한 장치다.
 *
 * 호출은 Server Component, Route Handler, Server Action에서만 수행한다.
 *
 * @see https://openweathermap.org/guide
 */

import { OpenWeatherError, toErrorKind } from '@/lib/weather-errors';
import {
  getCurrentPrecipitationProbability,
  toAirQuality,
  toCurrentWeather,
  toDailyForecast,
  toHourlyForecast,
  toWeatherLocation,
} from '@/lib/weather-transform';
import type {
  OpenWeatherAirPollutionResponse,
  OpenWeatherCurrentResponse,
  OpenWeatherForecastResponse,
  OpenWeatherGeocodingItem,
  WeatherLocation,
  WeatherSnapshot,
} from '@/types/weather';

const BASE_URL = 'https://api.openweathermap.org';

/**
 * 날씨 데이터 캐시 수명(초).
 * OpenWeather가 10분 주기로 데이터를 갱신하므로 그보다 짧게 잡을 이유가 없고,
 * 무료 플랜의 분당 60회 / 일 1,000회 한도를 지키는 1차 방어선 역할도 한다.
 */
const WEATHER_REVALIDATE_SECONDS = 600;

/** 지역 좌표는 사실상 변하지 않으므로 하루 동안 캐시한다. */
const GEOCODING_REVALIDATE_SECONDS = 60 * 60 * 24;

/** 지역 검색 결과 최대 노출 개수. */
const GEOCODING_RESULT_LIMIT = 5;

/** 섭씨 및 한국어 응답을 위한 공통 파라미터. */
const LOCALIZED_PARAMS = { units: 'metric', lang: 'kr' } as const;

/**
 * 환경 변수에서 API 키를 읽는다.
 *
 * 모듈 최상단이 아니라 호출 시점에 읽는다. 최상단에서 읽으면 빌드 시점 값이
 * 정적으로 고정되어, 배포 환경에서 키를 교체해도 반영되지 않는다.
 */
function resolveApiKey(): string {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    throw new OpenWeatherError(
      'missingApiKey',
      'OPENWEATHER_API_KEY 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.',
    );
  }

  return apiKey;
}

/**
 * OpenWeatherMap에 GET 요청을 보내고 JSON을 반환한다.
 *
 * 모든 엔드포인트가 이 함수를 거치게 해서 캐싱 정책과 에러 변환 규칙을 한곳에 모았다.
 * 실패 시 응답 본문을 그대로 throw하지 않는다. 본문에 쿼리스트링이 포함되어
 * API 키가 로그나 에러 화면으로 새어 나갈 수 있기 때문이다.
 */
async function requestOpenWeather<TResponse>(
  path: string,
  params: Record<string, string>,
  revalidateSeconds: number,
): Promise<TResponse> {
  const url = new URL(path, BASE_URL);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set('appid', resolveApiKey());

  let response: Response;

  try {
    // Next.js 16부터 fetch는 기본적으로 캐시되지 않으므로 revalidate를 명시해야 한다.
    response = await fetch(url, { next: { revalidate: revalidateSeconds } });
  } catch (cause) {
    throw new OpenWeatherError('network', 'OpenWeatherMap에 연결하지 못했습니다.', { cause });
  }

  if (!response.ok) {
    throw new OpenWeatherError(
      toErrorKind(response.status),
      `OpenWeatherMap 요청이 실패했습니다. (${path}, HTTP ${response.status})`,
      { status: response.status },
    );
  }

  return response.json() as Promise<TResponse>;
}

/**
 * 지역명으로 좌표를 검색한다. 요구사항 명세서 5장의 지역 검색에 사용한다.
 *
 * 빈 검색어는 API를 호출하지 않고 즉시 빈 배열을 반환한다.
 * 사용자가 입력을 지웠을 때 불필요한 호출로 쿼터를 소모하지 않기 위함이다.
 */
export async function searchLocations(
  query: string,
  limit: number = GEOCODING_RESULT_LIMIT,
): Promise<WeatherLocation[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const results = await requestOpenWeather<OpenWeatherGeocodingItem[]>(
    '/geo/1.0/direct',
    { q: trimmedQuery, limit: String(limit) },
    GEOCODING_REVALIDATE_SECONDS,
  );

  return results.map(toWeatherLocation);
}

/**
 * 좌표로 지역 정보를 역조회한다.
 * 요구사항 명세서 12장의 "현재 위치 날씨"에서 좌표를 지역명으로 바꿀 때 사용한다.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<WeatherLocation | null> {
  const results = await requestOpenWeather<OpenWeatherGeocodingItem[]>(
    '/geo/1.0/reverse',
    { lat: String(latitude), lon: String(longitude), limit: '1' },
    GEOCODING_REVALIDATE_SECONDS,
  );

  const nearest = results[0];
  return nearest ? toWeatherLocation(nearest) : null;
}

/**
 * 한 지역의 날씨 화면에 필요한 데이터를 한 번에 조회한다.
 *
 * 현재 날씨·예보·대기질은 서로 의존하지 않으므로 병렬로 요청한다.
 * 다만 대기질은 부가 정보이므로 `Promise.allSettled`로 분리해,
 * 대기질 조회가 실패해도 날씨 화면 전체가 실패하지 않게 한다.
 */
export async function getWeatherSnapshot(location: WeatherLocation): Promise<WeatherSnapshot> {
  const coordinates = {
    lat: String(location.latitude),
    lon: String(location.longitude),
  };

  const currentRequest = requestOpenWeather<OpenWeatherCurrentResponse>(
    '/data/2.5/weather',
    { ...coordinates, ...LOCALIZED_PARAMS },
    WEATHER_REVALIDATE_SECONDS,
  );

  const forecastRequest = requestOpenWeather<OpenWeatherForecastResponse>(
    '/data/2.5/forecast',
    { ...coordinates, ...LOCALIZED_PARAMS },
    WEATHER_REVALIDATE_SECONDS,
  );

  const airQualityRequest = requestOpenWeather<OpenWeatherAirPollutionResponse>(
    '/data/2.5/air_pollution',
    coordinates,
    WEATHER_REVALIDATE_SECONDS,
  );

  const [current, forecast, airQualityResult] = await Promise.all([
    currentRequest,
    forecastRequest,
    settle(airQualityRequest),
  ]);

  const daily = toDailyForecast(forecast);
  const today = daily[0];

  return {
    location,
    current: toCurrentWeather(current, {
      locationName: location.name,
      precipitationProbability: getCurrentPrecipitationProbability(forecast),
      minTemperature: today?.minTemperature,
      maxTemperature: today?.maxTemperature,
    }),
    hourly: toHourlyForecast(forecast),
    daily,
    airQuality: airQualityResult ? toAirQuality(airQualityResult) : null,
  };
}

/** 실패를 `null`로 흡수한다. 화면을 막을 필요가 없는 부가 요청에만 사용한다. */
async function settle<TValue>(promise: Promise<TValue>): Promise<TValue | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}
