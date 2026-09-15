import { HourlyWeatherCard } from '@/components/hourly-weather-card';
import { formatZonedHour } from '@/lib/date-format';
import type { CurrentWeather, HourlyForecast as HourlyForecastData } from '@/types/weather';

interface HourlyForecastProps {
  current: CurrentWeather;
  hourly: HourlyForecastData[];
}

/**
 * 요구사항 명세서 8장의 시간대별 날씨. 가로 스크롤 카드 형식이다.
 *
 * 첫 칸은 예보가 아니라 현재 날씨를 "지금"으로 표시한다. 무료 플랜의 예보는
 * 3시간 간격이라 첫 예보 슬롯이 최대 3시간 뒤일 수 있는데, 그것을 "지금"으로
 * 표기하면 사용자가 보는 값과 실제 현재 기온이 어긋난다.
 */
export function HourlyForecast({ current, hourly }: HourlyForecastProps) {
  return (
    <section aria-labelledby="hourly-forecast-heading" className="space-y-3">
      <h2 id="hourly-forecast-heading" className="text-xl font-semibold">
        시간별 날씨
      </h2>

      {/* 명세 18장의 모바일 가로 스크롤. 패딩을 스크롤 컨테이너에 두면
          카드가 화면 가장자리까지 이어져 "더 있다"는 단서가 생긴다.
          스크롤은 이 래퍼에서만 일어나 페이지 전체가 옆으로 밀리지 않는다. */}
      <div className="-mx-4 overflow-x-auto overscroll-x-contain px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:-mx-6 md:px-6">
        <ul className="flex snap-x snap-proximity gap-1 pb-1">
          <HourlyWeatherCard
            timeLabel="지금"
            temperature={current.temperature}
            condition={current.condition}
            icon={current.icon}
            precipitationProbability={current.precipitationProbability}
            isCurrent
          />

          {hourly.map((item) => (
            <HourlyWeatherCard
              key={item.forecastAt}
              timeLabel={formatZonedHour(item.forecastAt, current.timezoneOffset)}
              temperature={item.temperature}
              condition={item.condition}
              icon={item.icon}
              precipitationProbability={item.precipitationProbability}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
