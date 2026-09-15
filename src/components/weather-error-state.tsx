'use client';

import { CloudOff, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from 'cn';

interface WeatherErrorStateProps {
  /** 기본 문구는 요구사항 명세서 17장의 API 오류 화면을 따른다. */
  title?: string;
  description: string;
  /**
   * 재시도 동작. Error Boundary는 자신의 `retry`를 넘기고,
   * 서버에서 오류를 직접 렌더한 경우는 생략해 라우트 새로고침에 맡긴다.
   */
  onRetry?: () => void;
  /** 재시도해도 결과가 달라지지 않는 오류(잘못된 API 키 등)에서는 버튼을 숨긴다. */
  canRetry?: boolean;
}

/**
 * 요구사항 명세서 17장의 오류 UI.
 *
 * 문구는 항상 서버에서 분류한 `OpenWeatherErrorKind`를 통해 만들어진 것을 받는다.
 * 프로덕션에서 Server Component의 에러 메시지는 Next.js가 가려버리므로,
 * `error.message`를 그대로 보여주면 한국어 안내가 영어 일반 문구로 바뀐다.
 */
export function WeatherErrorState({
  title = '날씨 정보를 불러오지 못했습니다.',
  description,
  onRetry,
  canRetry = true,
}: WeatherErrorStateProps) {
  const router = useRouter();
  const [isRetrying, startRetrying] = useTransition();

  const handleRetry = () => {
    startRetrying(() => {
      if (onRetry) {
        onRetry();
        return;
      }

      // 실패한 응답은 캐시되지 않으므로(200만 저장) 새로고침이 실제로 재요청한다.
      router.refresh();
    });
  };

  return (
    <section role="alert" className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="bg-destructive/10 rounded-full p-4">
        <CloudOff className="text-destructive size-8" aria-hidden />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground mx-auto max-w-md text-sm">{description}</p>
      </div>

      {canRetry && (
        <Button onClick={handleRetry} disabled={isRetrying}>
          <RefreshCw className={cn('size-4', isRetrying && 'animate-spin')} aria-hidden />
          다시 시도
        </Button>
      )}
    </section>
  );
}
