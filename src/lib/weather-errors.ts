import type { WeatherLocation } from '@/types/weather';

/**
 * OpenWeatherMap 호출 실패 원인 분류.
 *
 * 서버에서 발생한 원인을 클라이언트 에러 UI까지 그대로 전달하기 위한 값이므로,
 * 원본 응답 본문이나 API 키가 섞이지 않도록 이 분류만 노출한다.
 */
export type OpenWeatherErrorKind =
  | 'missingApiKey'
  | 'unauthorized'
  | 'notFound'
  | 'rateLimited'
  | 'serverError'
  | 'network'
  | 'unknown';

/** OpenWeatherMap 호출 실패를 나타내는 도메인 에러. */
export class OpenWeatherError extends Error {
  readonly kind: OpenWeatherErrorKind;
  readonly status?: number;

  constructor(
    kind: OpenWeatherErrorKind,
    message: string,
    options?: { status?: number; cause?: unknown },
  ) {
    super(message, { cause: options?.cause });
    this.name = 'OpenWeatherError';
    this.kind = kind;
    this.status = options?.status;
  }
}

/** HTTP 상태 코드를 에러 분류로 변환한다. */
export function toErrorKind(status: number): OpenWeatherErrorKind {
  if (status === 401) return 'unauthorized';
  if (status === 404) return 'notFound';
  if (status === 429) return 'rateLimited';
  if (status >= 500) return 'serverError';
  return 'unknown';
}

/**
 * 에러 분류별 사용자 노출 문구.
 * 요구사항 명세서 17장의 오류 UI 문구를 기준으로 한다.
 */
const ERROR_MESSAGES: Record<OpenWeatherErrorKind, string> = {
  missingApiKey: 'OpenWeatherMap API 키가 설정되지 않았습니다. 관리자에게 문의해주세요.',
  unauthorized:
    'API 인증에 실패했습니다. 발급 직후라면 키가 활성화될 때까지 최대 30분이 걸릴 수 있습니다.',
  notFound: '해당 지역의 날씨 정보를 찾을 수 없습니다. 다른 지역명을 입력해주세요.',
  rateLimited: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  serverError: '날씨 서비스가 일시적으로 응답하지 않습니다. 잠시 후 다시 시도해주세요.',
  network: '인터넷 연결 상태를 확인해주세요.',
  unknown: '날씨 정보를 불러오지 못했습니다.',
};

/**
 * 알 수 없는 에러를 사용자에게 보여줄 한국어 문구로 변환한다.
 *
 * `error.tsx` 같은 Error Boundary는 임의의 값을 받을 수 있으므로
 * `OpenWeatherError`가 아닌 경우에도 안전하게 기본 문구를 반환한다.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof OpenWeatherError) {
    return ERROR_MESSAGES[error.kind];
  }
  return ERROR_MESSAGES.unknown;
}

/** 재시도해도 결과가 달라질 여지가 있는 에러인지 판단한다. */
export function isRetryable(error: unknown): boolean {
  if (!(error instanceof OpenWeatherError)) return true;
  return (
    error.kind === 'network' || error.kind === 'serverError' || error.kind === 'rateLimited'
  );
}

/** 기본 진입 지역. 요구사항 명세서 3장의 "기본 지역 날씨 표시" 단계에서 사용한다. */
export const DEFAULT_LOCATION: WeatherLocation = {
  name: '서울특별시',
  countryCode: 'KR',
  latitude: 37.5665,
  longitude: 126.978,
};
