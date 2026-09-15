'use client';

import { catchError, type ErrorInfo } from 'next/error';

import { WeatherErrorState } from '@/components/weather-error-state';
import { getErrorMessage } from '@/lib/weather-errors';

/**
 * 날씨 영역만 감싸는 Error Boundary.
 *
 * `error.tsx`는 라우트 세그먼트 전체를 대체해서 헤더와 지역 검색까지 사라진다.
 * `catchError`로 경계를 좁히면 오류가 나도 헤더가 남아, 사용자가 다른 지역을
 * 검색해 스스로 빠져나올 수 있다.
 *
 * `reset`이 아니라 `retry`를 쓴다. `reset`은 에러 상태만 지우고 다시 렌더하므로
 * Server Component에서 발생한 오류는 복구되지 않는다.
 *
 * @see node_modules/next/dist/docs/01-app/03-api-reference/04-functions/catchError.md
 */
// 이 Fallback은 props를 쓰지 않는다. 다만 `catchError`가 props 타입에
// 인덱스 시그니처를 요구하면서 `children`을 덧붙이므로, `Record<string, never>`로
// 두면 `children: never`가 되어 경계를 감쌀 수 없다.
function WeatherErrorFallback(_props: Record<string, unknown>, { error, retry }: ErrorInfo) {
  // 여기까지 올라온 오류는 API 실패가 아니라 예상 못한 렌더링 오류다.
  // 프로덕션에서는 메시지가 가려지므로 `getErrorMessage`가 기본 문구를 돌려준다.
  return <WeatherErrorState description={getErrorMessage(error)} onRetry={retry} />;
}

export const WeatherErrorBoundary = catchError(WeatherErrorFallback);
