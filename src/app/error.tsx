'use client';

import { WeatherErrorState } from '@/components/weather-error-state';
import { getErrorMessage } from '@/lib/weather-errors';

interface ErrorPageProps {
  error: Error & { digest?: string };
  /** 데이터를 다시 받아 세그먼트를 재렌더한다. `reset`과 달리 서버 오류도 복구된다. */
  retry: () => void;
}

/**
 * 라우트 세그먼트 전체의 Error Boundary.
 *
 * 실제 API 실패는 페이지 안쪽의 `WeatherErrorBoundary`와 서버 측 처리에서 잡으므로,
 * 여기까지 오는 것은 페이지나 헤더 자체가 깨진 예상 밖의 경우다.
 */
export default function ErrorPage({ error, retry }: ErrorPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 md:px-6">
      <div className="w-full">
        <WeatherErrorState description={getErrorMessage(error)} onRetry={retry} />
      </div>
    </main>
  );
}
