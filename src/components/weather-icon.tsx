import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Cloudy,
  Moon,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { createElement } from 'react';

/**
 * OpenWeather 아이콘 코드를 Lucide 아이콘으로 매핑한다.
 *
 * OpenWeather가 제공하는 PNG CDN 대신 SVG 아이콘을 쓰는 이유는 두 가지다.
 * - 다크모드에서 `currentColor`로 자연스럽게 대비가 맞는다. PNG는 색이 고정된다.
 * - 외부 이미지 요청이 사라져 초기 렌더가 빨라진다.
 *
 * 코드 뒤의 `d`/`n`은 주간/야간을 뜻한다. 구름 이상으로 덮인 상태는 주야 구분이
 * 의미가 없어 같은 아이콘을 쓴다.
 *
 * @see https://openweathermap.org/weather-conditions
 */
const WEATHER_ICONS: Record<string, LucideIcon> = {
  '01d': Sun, // 맑음 (주간)
  '01n': Moon, // 맑음 (야간)
  '02d': CloudSun, // 구름 조금 (주간)
  '02n': CloudMoon, // 구름 조금 (야간)
  '03d': Cloud, // 구름 많음
  '03n': Cloud,
  '04d': Cloudy, // 흐림
  '04n': Cloudy,
  '09d': CloudDrizzle, // 소나기
  '09n': CloudDrizzle,
  '10d': CloudRain, // 비
  '10n': CloudRain,
  '11d': CloudLightning, // 천둥번개
  '11n': CloudLightning,
  '13d': CloudSnow, // 눈
  '13n': CloudSnow,
  '50d': CloudFog, // 안개
  '50n': CloudFog,
};

interface WeatherIconProps {
  /** OpenWeather 응답의 아이콘 코드. 예: `01d` */
  code: string;
  className?: string;
  strokeWidth?: number;
}

/**
 * 날씨 상태에 해당하는 아이콘을 렌더링한다.
 *
 * 아이콘 코드에 따라 렌더링할 컴포넌트가 달라지므로 `createElement`로 직접 생성한다.
 * 호출부에서 `const Icon = lookup(code)` 후 `<Icon />`으로 쓰면 렌더마다 컴포넌트
 * 타입이 바뀌는 형태가 되어, 이 동적 분기를 이 컴포넌트 한 곳에 가둔다.
 *
 * 모르는 코드는 구름 아이콘으로 대체해 화면이 비지 않게 한다.
 */
export function WeatherIcon({ code, className, strokeWidth }: WeatherIconProps) {
  return createElement(WEATHER_ICONS[code] ?? Cloud, {
    className,
    strokeWidth,
    'aria-hidden': true,
  });
}
