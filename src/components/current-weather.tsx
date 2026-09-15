import { FavoriteToggle } from '@/components/favorite-toggle';
import { WeatherIcon } from '@/components/weather-icon';
import { formatZonedFullDate, formatZonedTime } from '@/lib/date-format';
import type { CurrentWeather as CurrentWeatherData, WeatherLocation } from '@/types/weather';

interface CurrentWeatherProps {
  weather: CurrentWeatherData;
  /** 별표 버튼에 넘길 지역 정보. 좌표가 즐겨찾기 식별자로 쓰인다. */
  location: WeatherLocation;
}

/**
 * 요구사항 명세서 6장의 현재 날씨 영역. 화면에서 가장 강조되는 블록이다.
 *
 * 표기 시각은 `Date.now()`가 아니라 API의 관측 시각(`observedAt`)을 쓴다.
 * 렌더 시점의 현재 시각을 읽으면 정적 프리렌더가 불가능해지고 하이드레이션 불일치도
 * 생긴다. OpenWeather가 10분 주기로 갱신하므로 관측 시각이 곧 현재 시각이며,
 * 어느 시점의 데이터인지 드러나서 더 정확하다.
 */
export function CurrentWeather({ weather, location }: CurrentWeatherProps) {
  return (
    <section className="flex flex-col items-center gap-3 py-4 text-center sm:py-6">
      <div className="w-full space-y-1">
        <div className="flex items-center justify-center gap-1 px-2">
          <h1 className="text-2xl font-semibold tracking-tight break-keep">{weather.locationName}</h1>
          <FavoriteToggle location={location} />
        </div>
        <p className="text-muted-foreground px-4 text-xs sm:text-sm">
          {formatZonedFullDate(weather.observedAt, weather.timezoneOffset)}
          {' · '}
          {formatZonedTime(weather.observedAt, weather.timezoneOffset)} 기준
        </p>
      </div>

      <WeatherIcon code={weather.icon} className="text-primary size-20" strokeWidth={1.5} />

      <div className="flex flex-col items-center gap-1">
        <p className="text-6xl font-semibold tracking-tight">
          {weather.temperature}
          <span className="align-top text-3xl">°</span>
        </p>
        <p className="text-lg">{weather.condition}</p>
      </div>

      <dl className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
        <div className="flex gap-1.5">
          <dt>최고</dt>
          <dd className="text-foreground font-medium">{weather.maxTemperature}°</dd>
        </div>
        <div className="flex gap-1.5">
          <dt>최저</dt>
          <dd className="text-foreground font-medium">{weather.minTemperature}°</dd>
        </div>
        <div className="flex gap-1.5">
          <dt>체감</dt>
          <dd className="text-foreground font-medium">{weather.feelsLike}°</dd>
        </div>
      </dl>
    </section>
  );
}
