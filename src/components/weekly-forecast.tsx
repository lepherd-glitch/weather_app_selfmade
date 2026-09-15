import { DailyWeatherRow } from '@/components/daily-weather-row';
import { Card, CardContent } from '@/components/ui/card';
import { toZonedDateKey } from '@/lib/weather-transform';
import type { DailyForecast } from '@/types/weather';

interface WeeklyForecastProps {
  daily: DailyForecast[];
  /** 대상 지역의 UTC 오프셋(초). */
  timezoneOffset: number;
  /** API 관측 시각(Unix 초). "오늘"이 어느 날짜인지 판단하는 기준이다. */
  observedAt: number;
}

/**
 * 요구사항 명세서 9장의 일별 예보. 무료 플랜의 예보 범위에 맞춰 5일을 표시한다.
 *
 * "오늘"은 `Date.now()`가 아니라 API 관측 시각에서 유도한다. 렌더 중에 현재 시각을
 * 읽으면 정적 프리렌더가 깨지고 서버와 클라이언트의 판정이 달라질 수 있다.
 * 또한 첫 행을 무조건 "오늘"로 두는 방식도 쓸 수 없다. 자정 직전에는 첫 예보
 * 슬롯이 이미 다음 날일 수 있기 때문이다.
 */
export function WeeklyForecast({ daily, timezoneOffset, observedAt }: WeeklyForecastProps) {
  const todayDateKey = toZonedDateKey(observedAt, timezoneOffset);

  return (
    <section aria-labelledby="weekly-forecast-heading" className="space-y-3">
      <h2 id="weekly-forecast-heading" className="text-xl font-semibold">
        주간 날씨
      </h2>

      <Card className="rounded-2xl shadow-sm">
        <CardContent>
          <ul className="divide-y">
            {daily.map((forecast) => (
              <DailyWeatherRow
                key={forecast.date}
                forecast={forecast}
                timezoneOffset={timezoneOffset}
                isToday={forecast.date === todayDateKey}
              />
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
