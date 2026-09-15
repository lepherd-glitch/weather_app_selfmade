import { Droplets, Eye, Gauge, Leaf, Umbrella, Wind } from 'lucide-react';

import { WeatherDetailCard } from '@/components/weather-detail-card';
import type { AirQuality, AirQualityLevel, CurrentWeather } from '@/types/weather';

interface WeatherDetailGridProps {
  weather: CurrentWeather;
  airQuality: AirQuality | null;
}

/** OpenWeather 대기질 지수(1~5)의 한국어 등급 표기. */
const AIR_QUALITY_LABELS: Record<AirQualityLevel, string> = {
  good: '좋음',
  fair: '양호',
  moderate: '보통',
  poor: '나쁨',
  veryPoor: '매우 나쁨',
};

/**
 * 요구사항 명세서 7장의 상세 날씨 그리드.
 *
 * 명세서의 자외선 지수 항목은 유료 One Call API 3.0 전용이라 무료 플랜으로 조회할 수 없다.
 * 대신 무료 Air Pollution API의 대기질 지수로 대체한다.
 *
 * 열 수는 명세서 7장에 따라 모바일 2열, 태블릿 3열, PC 6열로 늘린다.
 */
export function WeatherDetailGrid({ weather, airQuality }: WeatherDetailGridProps) {
  return (
    <section aria-label="상세 날씨 정보">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <WeatherDetailCard
          icon={Droplets}
          label="습도"
          value={`${weather.humidity}`}
          caption="%"
        />
        <WeatherDetailCard
          icon={Wind}
          label="풍속"
          value={`${weather.windSpeed}`}
          caption="m/s"
        />
        <WeatherDetailCard
          icon={Umbrella}
          label="강수확률"
          value={
            weather.precipitationProbability === null
              ? null
              : `${weather.precipitationProbability}`
          }
          caption={weather.precipitationProbability === null ? undefined : '%'}
        />
        <WeatherDetailCard
          icon={Leaf}
          label="대기질"
          value={airQuality ? AIR_QUALITY_LABELS[airQuality.level] : null}
          caption={airQuality ? `PM2.5 ${airQuality.pm25}` : undefined}
        />
        <WeatherDetailCard
          icon={Gauge}
          label="기압"
          value={`${weather.pressure}`}
          caption="hPa"
        />
        <WeatherDetailCard
          icon={Eye}
          label="가시거리"
          value={`${weather.visibility}`}
          caption="km"
        />
      </div>
    </section>
  );
}
