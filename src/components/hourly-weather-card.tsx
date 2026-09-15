import { WeatherIcon } from '@/components/weather-icon';

interface HourlyWeatherCardProps {
  /** `지금` 또는 `14시` 같은 시각 라벨. */
  timeLabel: string;
  temperature: number;
  condition: string;
  icon: string;
  /** 강수 확률(%). 현재 날씨는 값이 없을 수 있다. */
  precipitationProbability: number | null;
  /** 첫 칸(현재 날씨)을 강조할지 여부. */
  isCurrent?: boolean;
}

/** 요구사항 명세서 8장의 시간별 예보 카드 한 칸. */
export function HourlyWeatherCard({
  timeLabel,
  temperature,
  condition,
  icon,
  precipitationProbability,
  isCurrent = false,
}: HourlyWeatherCardProps) {
  return (
    <li
      // `shrink-0`이 없으면 flex 컨테이너가 카드를 찌그러뜨려 가로 스크롤이 생기지 않는다.
      // `relative`는 아래 `sr-only`의 위치 기준을 이 카드로 고정한다. 기준이 없으면
      // 절대 위치가 문서 전체를 기준으로 잡혀 가로 스크롤 영역 밖으로 삐져나가고,
      // 모바일에서 페이지 전체가 옆으로 밀린다.
      className={`relative flex w-16 shrink-0 snap-start flex-col items-center gap-2 rounded-2xl px-2 py-3 ${
        isCurrent ? 'bg-muted' : ''
      }`}
    >
      <span className={`text-xs ${isCurrent ? 'font-medium' : 'text-muted-foreground'}`}>
        {timeLabel}
      </span>
      <WeatherIcon code={icon} className="text-primary size-6" strokeWidth={1.75} />
      <span className="sr-only">{condition}</span>
      <span className="text-sm font-semibold tracking-tight">{temperature}°</span>
      <span className="text-muted-foreground text-xs">
        {precipitationProbability === null ? '-' : `${precipitationProbability}%`}
      </span>
    </li>
  );
}
