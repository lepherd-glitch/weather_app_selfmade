/**
 * OpenWeatherMap 연동 타입 정의.
 *
 * 크게 두 계층으로 나뉜다.
 * - `OpenWeather*`: API가 내려주는 원본(snake_case) 응답 형태. 절대 컴포넌트에서 직접 쓰지 않는다.
 * - 그 외: UI가 소비하는 가공(camelCase) 형태. API 스펙이 바뀌어도 이 계층은 유지하는 것이 목표다.
 *
 * @see https://openweathermap.org/guide
 */

/* ------------------------------------------------------------------ */
/* API 원본 응답 타입                                                  */
/* ------------------------------------------------------------------ */

/** 날씨 상태 코드/설명/아이콘. `lang=kr` 요청 시 `description`이 한국어로 내려온다. */
export interface OpenWeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

/** 기온·습도·기압 등 핵심 수치. `units=metric` 기준으로 섭씨(°C), hPa 단위다. */
export interface OpenWeatherMetrics {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

/** 풍속(m/s)과 풍향(degree). */
export interface OpenWeatherWind {
  speed: number;
  deg: number;
  gust?: number;
}

/** `GET /data/2.5/weather` 응답. */
export interface OpenWeatherCurrentResponse {
  coord: { lon: number; lat: number };
  weather: OpenWeatherCondition[];
  main: OpenWeatherMetrics;
  visibility: number;
  wind: OpenWeatherWind;
  clouds: { all: number };
  rain?: { '1h'?: number; '3h'?: number };
  snow?: { '1h'?: number; '3h'?: number };
  dt: number;
  sys: {
    country?: string;
    sunrise: number;
    sunset: number;
  };
  /** 해당 도시의 UTC 기준 오프셋(초). 로컬 시각 계산에 반드시 필요하다. */
  timezone: number;
  id: number;
  name: string;
}

/** `GET /data/2.5/forecast` 목록의 3시간 단위 항목. */
export interface OpenWeatherForecastItem {
  dt: number;
  main: OpenWeatherMetrics;
  weather: OpenWeatherCondition[];
  clouds: { all: number };
  wind: OpenWeatherWind;
  visibility: number;
  /** 강수 확률. 0~1 사이의 비율이며 백분율이 아니다. */
  pop: number;
  dt_txt: string;
}

/** `GET /data/2.5/forecast` 응답. 무료 플랜은 3시간 간격 5일치(최대 40건)를 내려준다. */
export interface OpenWeatherForecastResponse {
  cnt: number;
  list: OpenWeatherForecastItem[];
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

/** `GET /geo/1.0/direct` 및 `GET /geo/1.0/reverse` 응답 항목. */
export interface OpenWeatherGeocodingItem {
  name: string;
  /** 언어 코드별 지역명. 한국어는 `ko` 키에 담긴다. */
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

/** `GET /data/2.5/air_pollution` 응답. */
export interface OpenWeatherAirPollutionResponse {
  list: {
    /** 대기질 지수. 1(좋음) ~ 5(매우 나쁨). */
    main: { aqi: 1 | 2 | 3 | 4 | 5 };
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
    dt: number;
  }[];
}

/* ------------------------------------------------------------------ */
/* UI 소비용 가공 타입                                                 */
/* ------------------------------------------------------------------ */

/** 지역 검색 결과 및 선택된 지역을 나타내는 단일 표현. */
export interface WeatherLocation {
  /** 화면에 노출할 지역명. 한국어 이름이 있으면 그것을 우선한다. */
  name: string;
  /** ISO 3166 국가 코드. 예: `KR` */
  countryCode: string;
  /** 시/도 등 상위 행정구역. API가 제공하지 않으면 생략된다. */
  region?: string;
  latitude: number;
  longitude: number;
}

/** 요구사항 명세서 6·7장의 현재 날씨 및 상세 정보 표시에 필요한 값 묶음. */
export interface CurrentWeather {
  locationName: string;
  /** 관측 시각(Unix 초, UTC). */
  observedAt: number;
  /** 해당 지역의 UTC 오프셋(초). 로컬 날짜/시간 표기에 사용한다. */
  timezoneOffset: number;
  temperature: number;
  feelsLike: number;
  minTemperature: number;
  maxTemperature: number;
  condition: string;
  icon: string;
  humidity: number;
  /** 풍속(m/s). */
  windSpeed: number;
  /** 기압(hPa). */
  pressure: number;
  /** 가시거리(km). API 원본은 미터 단위이므로 변환된 값이다. */
  visibility: number;
  /**
   * 강수 확률(%). Current Weather API에는 이 필드가 없어
   * 예보 데이터의 가장 가까운 시간대 값에서 채워 넣는다.
   */
  precipitationProbability: number | null;
  sunrise: number;
  sunset: number;
}

/** 요구사항 명세서 8장의 시간대별 예보 한 칸. */
export interface HourlyForecast {
  /** 예보 시각(Unix 초, UTC). */
  forecastAt: number;
  temperature: number;
  condition: string;
  icon: string;
  /** 강수 확률(%). */
  precipitationProbability: number;
}

/** 요구사항 명세서 9장의 일별 예보 한 줄. */
export interface DailyForecast {
  /** 해당 지역 기준 날짜 키. `YYYY-MM-DD` 형식. */
  date: string;
  /** 정오에 가장 가까운 시점의 예보 시각(Unix 초, UTC). 요일 표기에 사용한다. */
  representativeAt: number;
  minTemperature: number;
  maxTemperature: number;
  condition: string;
  icon: string;
  /** 해당 날짜 예보 중 최대 강수 확률(%). */
  precipitationProbability: number;
}

/** OpenWeather 대기질 지수(1~5) 등급. */
export type AirQualityLevel = 'good' | 'fair' | 'moderate' | 'poor' | 'veryPoor';

/**
 * 요구사항 명세서 7장의 자외선 지수 대체 항목.
 * 자외선 지수는 유료 One Call API 3.0 전용이라 무료 Air Pollution API로 대체한다.
 */
export interface AirQuality {
  index: 1 | 2 | 3 | 4 | 5;
  level: AirQualityLevel;
  /** 초미세먼지 농도(µg/m³). */
  pm25: number;
  /** 미세먼지 농도(µg/m³). */
  pm10: number;
}

/** 한 지역의 날씨 화면을 그리는 데 필요한 전체 데이터. */
export interface WeatherSnapshot {
  location: WeatherLocation;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  /** 대기질 조회가 실패해도 화면 전체를 막지 않도록 null을 허용한다. */
  airQuality: AirQuality | null;
}
