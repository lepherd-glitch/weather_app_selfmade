import { WeatherIcon } from '@/components/weather-icon';
import { formatZonedMonthDay, formatZonedWeekday } from '@/lib/date-format';
import type { DailyForecast } from '@/types/weather';

interface DailyWeatherRowProps {
  forecast: DailyForecast;
  timezoneOffset: number;
  /** 오늘이면 요일 대신 "오늘"로 표기한다. */
  isToday: boolean;
}

/** 요구사항 명세서 9장의 일별 예보 한 줄. */
export function DailyWeatherRow({ forecast, timezoneOffset, isToday }: DailyWeatherRowProps) {
  const weekday = isToday
    ? '오늘'
    : formatZonedWeekday(forecast.representativeAt, timezoneOffset);

  return (
    // 고정 폭 컬럼들이 좁은 화면에서 날씨 상태 텍스트를 잘라먹으므로
    // 모바일에서는 폭과 글자 크기를 한 단계 줄인다.
    <li className="flex items-center gap-2 py-2.5 sm:gap-3">
      <div className="w-14 shrink-0 sm:w-20">
        <p className="text-sm font-medium">{weekday}</p>
        <p className="text-muted-foreground text-xs">
          {formatZonedMonthDay(forecast.representativeAt, timezoneOffset)}
        </p>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
        <WeatherIcon
          code={forecast.icon}
          className="text-primary size-5 shrink-0 sm:size-6"
          strokeWidth={1.75}
        />
        <span className="truncate text-xs sm:text-sm">{forecast.condition}</span>
      </div>

      <span className="text-muted-foreground w-9 shrink-0 text-right text-xs sm:w-12 sm:text-sm">
        {forecast.precipitationProbability}%
      </span>

      {/* 최저/최고는 자릿수가 고정되지 않아 폭을 고정해 행마다 세로로 정렬한다. */}
      <div className="w-16 shrink-0 text-right text-xs tracking-tight sm:w-20 sm:text-sm">
        <span className="text-muted-foreground">{forecast.minTemperature}°</span>
        <span className="text-muted-foreground/50 mx-0.5 sm:mx-1">/</span>
        <span className="font-medium">{forecast.maxTemperature}°</span>
      </div>
    </li>
  );
}
