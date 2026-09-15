/**
 * OpenWeatherMap 원본 응답을 UI 소비용 형태로 변환하는 순수 함수 모음.
 *
 * 이 모듈은 의도적으로 외부 의존성과 I/O를 갖지 않는다.
 * 덕분에 서버/클라이언트 어디서든 쓸 수 있고 단위 테스트도 쉽다.
 */

import type {
  AirQuality,
  AirQualityLevel,
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
  OpenWeatherAirPollutionResponse,
  OpenWeatherCurrentResponse,
  OpenWeatherForecastItem,
  OpenWeatherForecastResponse,
  OpenWeatherGeocodingItem,
  WeatherLocation,
} from '@/types/weather';

/** 24시간 예보에 필요한 항목 수. 예보 간격이 3시간이므로 8칸이다. */
const HOURLY_FORECAST_SLOTS = 24 / 3;

/** 무료 플랜의 예보 범위가 5일이므로 일별 예보도 5일로 제한한다. */
const MAX_DAILY_FORECAST_DAYS = 5;

/** 하루를 대표하는 날씨로 선택할 기준 시각(현지 시간). */
const REPRESENTATIVE_HOUR = 12;

const AIR_QUALITY_LEVELS: Record<AirQuality['index'], AirQualityLevel> = {
  1: 'good',
  2: 'fair',
  3: 'moderate',
  4: 'poor',
  5: 'veryPoor',
};

/* ------------------------------------------------------------------ */
/* 시간 계산 유틸                                                      */
/* ------------------------------------------------------------------ */

/**
 * UTC 기준 Unix 초를 해당 지역의 현지 시각으로 옮긴 `Date`를 만든다.
 *
 * 반환된 `Date`의 **UTC 게터**(`getUTCHours` 등)가 현지 시각을 가리킨다.
 * 서버(예: UTC)와 브라우저(예: KST)의 로컬 타임존이 달라도 동일한 결과를 얻기 위한 방식이며,
 * 이를 지키지 않으면 예보의 날짜 경계가 실행 환경에 따라 어긋난다.
 *
 * @param unixSeconds UTC 기준 Unix 타임스탬프(초)
 * @param timezoneOffsetSeconds 대상 지역의 UTC 오프셋(초). API의 `timezone` 필드 값
 */
export function toZonedDate(unixSeconds: number, timezoneOffsetSeconds: number): Date {
  return new Date((unixSeconds + timezoneOffsetSeconds) * 1000);
}

/** 현지 시각 기준 `YYYY-MM-DD` 날짜 키를 만든다. 일별 그룹핑의 기준값이다. */
export function toZonedDateKey(unixSeconds: number, timezoneOffsetSeconds: number): string {
  return toZonedDate(unixSeconds, timezoneOffsetSeconds).toISOString().slice(0, 10);
}

/** 현지 시각의 "시" 값(0~23)을 반환한다. */
function getZonedHour(unixSeconds: number, timezoneOffsetSeconds: number): number {
  return toZonedDate(unixSeconds, timezoneOffsetSeconds).getUTCHours();
}

/* ------------------------------------------------------------------ */
/* 단위 변환 유틸                                                      */
/* ------------------------------------------------------------------ */

/** 0~1 비율로 내려오는 강수 확률을 백분율 정수로 변환한다. */
function toPercent(ratio: number): number {
  return Math.round(ratio * 100);
}

/** 미터 단위 가시거리를 km로 변환한다. 소수 첫째 자리까지 유지한다. */
function toKilometers(meters: number): number {
  return Math.round((meters / 1000) * 10) / 10;
}

/* ------------------------------------------------------------------ */
/* 지역 정보 변환                                                      */
/* ------------------------------------------------------------------ */

/**
 * Geocoding 응답을 `WeatherLocation`으로 변환한다.
 *
 * Geocoding API는 `lang` 파라미터를 지원하지 않으므로,
 * 한국어 지역명은 `local_names.ko`에서 직접 꺼내야 한다.
 */
export function toWeatherLocation(item: OpenWeatherGeocodingItem): WeatherLocation {
  return {
    name: item.local_names?.ko ?? item.name,
    countryCode: item.country,
    region: item.state,
    latitude: item.lat,
    longitude: item.lon,
  };
}

/* ------------------------------------------------------------------ */
/* 현재 날씨 변환                                                      */
/* ------------------------------------------------------------------ */

/**
 * 현재 날씨 응답을 UI 형태로 변환한다.
 *
 * Current Weather API만으로는 채울 수 없는 값이 두 가지 있어 외부에서 주입받는다.
 * - `precipitationProbability`: 응답에 아예 없는 필드라 예보의 가장 가까운 시간대 값을 쓴다.
 * - `minTemperature` / `maxTemperature`: 응답의 `temp_min`/`temp_max`는 일일 최저·최고가 아니라
 *   관측 순간의 지역 내 편차라서, 대도시가 아니면 현재 기온과 동일한 값이 내려온다.
 *   요구사항 명세서 6장의 "최고 27° / 최저 18°" 표기는 당일 예보 집계값을 써야 한다.
 */
export function toCurrentWeather(
  response: OpenWeatherCurrentResponse,
  options: {
    locationName?: string;
    precipitationProbability?: number | null;
    minTemperature?: number;
    maxTemperature?: number;
  } = {},
): CurrentWeather {
  const condition = response.weather[0];

  return {
    locationName: options.locationName ?? response.name,
    observedAt: response.dt,
    timezoneOffset: response.timezone,
    temperature: Math.round(response.main.temp),
    feelsLike: Math.round(response.main.feels_like),
    minTemperature: options.minTemperature ?? Math.round(response.main.temp_min),
    maxTemperature: options.maxTemperature ?? Math.round(response.main.temp_max),
    condition: condition?.description ?? '정보 없음',
    icon: condition?.icon ?? '01d',
    humidity: response.main.humidity,
    windSpeed: Math.round(response.wind.speed * 10) / 10,
    pressure: response.main.pressure,
    visibility: toKilometers(response.visibility),
    precipitationProbability: options.precipitationProbability ?? null,
    sunrise: response.sys.sunrise,
    sunset: response.sys.sunset,
  };
}

/* ------------------------------------------------------------------ */
/* 예보 변환                                                           */
/* ------------------------------------------------------------------ */

/** 3시간 단위 예보 목록에서 앞 24시간 구간을 잘라 시간별 예보로 변환한다. */
export function toHourlyForecast(response: OpenWeatherForecastResponse): HourlyForecast[] {
  return response.list.slice(0, HOURLY_FORECAST_SLOTS).map((item) => ({
    forecastAt: item.dt,
    temperature: Math.round(item.main.temp),
    condition: item.weather[0]?.description ?? '정보 없음',
    icon: item.weather[0]?.icon ?? '01d',
    precipitationProbability: toPercent(item.pop),
  }));
}

/**
 * 3시간 단위 예보를 현지 날짜별로 집계해 일별 예보로 변환한다.
 *
 * 무료 플랜에는 일별 예보 엔드포인트가 없어 직접 집계해야 한다. 집계 규칙은 다음과 같다.
 * - 최저/최고 기온: 해당 날짜 전체 구간의 `temp_min` 최솟값 / `temp_max` 최댓값
 * - 대표 날씨: 현지 시각 정오에 가장 가까운 항목 (첫 항목을 쓰면 새벽 날씨가 대표가 되어 부정확하다)
 * - 강수 확률: 해당 날짜 구간의 최댓값 (하루 중 비 올 가능성을 보수적으로 표기)
 *
 * 첫 조회 날짜는 이미 지난 시간대가 잘려 있어 데이터가 일부만 존재할 수 있고,
 * 마지막 날짜 역시 불완전하게 내려오므로 최대 5일로 제한한다.
 */
export function toDailyForecast(response: OpenWeatherForecastResponse): DailyForecast[] {
  const timezoneOffset = response.city.timezone;
  const groupedByDate = new Map<string, OpenWeatherForecastItem[]>();

  for (const item of response.list) {
    const dateKey = toZonedDateKey(item.dt, timezoneOffset);
    const bucket = groupedByDate.get(dateKey);

    if (bucket) {
      bucket.push(item);
    } else {
      groupedByDate.set(dateKey, [item]);
    }
  }

  return [...groupedByDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, MAX_DAILY_FORECAST_DAYS)
    .map(([date, items]) => {
      const representative = pickRepresentativeItem(items, timezoneOffset);

      return {
        date,
        representativeAt: representative.dt,
        minTemperature: Math.round(Math.min(...items.map((item) => item.main.temp_min))),
        maxTemperature: Math.round(Math.max(...items.map((item) => item.main.temp_max))),
        condition: representative.weather[0]?.description ?? '정보 없음',
        icon: representative.weather[0]?.icon ?? '01d',
        precipitationProbability: toPercent(Math.max(...items.map((item) => item.pop))),
      };
    });
}

/** 하루치 예보 항목 중 현지 정오에 가장 가까운 항목을 고른다. */
function pickRepresentativeItem(
  items: OpenWeatherForecastItem[],
  timezoneOffsetSeconds: number,
): OpenWeatherForecastItem {
  return items.reduce((closest, item) => {
    const itemDistance = Math.abs(
      getZonedHour(item.dt, timezoneOffsetSeconds) - REPRESENTATIVE_HOUR,
    );
    const closestDistance = Math.abs(
      getZonedHour(closest.dt, timezoneOffsetSeconds) - REPRESENTATIVE_HOUR,
    );

    return itemDistance < closestDistance ? item : closest;
  });
}

/**
 * 예보 목록에서 현재 시점에 가장 가까운 강수 확률을 찾는다.
 * 현재 날씨 카드의 강수 확률 항목을 채우기 위한 값이다.
 */
export function getCurrentPrecipitationProbability(
  response: OpenWeatherForecastResponse,
): number | null {
  const nearest = response.list[0];
  return nearest ? toPercent(nearest.pop) : null;
}

/* ------------------------------------------------------------------ */
/* 대기질 변환                                                         */
/* ------------------------------------------------------------------ */

/** 대기질 응답을 UI 형태로 변환한다. 관측값이 없으면 `null`을 반환한다. */
export function toAirQuality(response: OpenWeatherAirPollutionResponse): AirQuality | null {
  const measurement = response.list[0];
  if (!measurement) return null;

  return {
    index: measurement.main.aqi,
    level: AIR_QUALITY_LEVELS[measurement.main.aqi],
    pm25: Math.round(measurement.components.pm2_5),
    pm10: Math.round(measurement.components.pm10),
  };
}
