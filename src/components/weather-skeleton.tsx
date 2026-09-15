import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/** 반복 렌더링용 인덱스 배열. 실제 데이터 개수와 동일하게 맞춰 레이아웃 이동을 줄인다. */
const DETAIL_CARD_COUNT = 6;
const HOURLY_CARD_COUNT = 9;
const DAILY_ROW_COUNT = 5;

/**
 * 요구사항 명세서 16장의 로딩 UI.
 *
 * 실제 화면과 같은 높이·간격으로 배치해 데이터가 도착할 때 레이아웃이 튀지 않게 한다.
 */
export function WeatherSkeleton() {
  return (
    <div className="space-y-8" aria-busy aria-label="날씨 정보를 불러오는 중">
      <section className="flex flex-col items-center gap-3 py-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="size-20 rounded-full" />
        <Skeleton className="h-16 w-28" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-4 w-48" />
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: DETAIL_CARD_COUNT }, (_, index) => (
          <Card key={index} size="sm" className="rounded-2xl shadow-sm">
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-6 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="space-y-3">
        <Skeleton className="h-7 w-28" />
        <div className="-mx-4 flex gap-1 overflow-hidden px-4 md:-mx-6 md:px-6">
          {Array.from({ length: HOURLY_CARD_COUNT }, (_, index) => (
            <div key={index} className="flex w-16 shrink-0 flex-col items-center gap-2 px-2 py-3">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-3 w-6" />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <Skeleton className="h-7 w-24" />
        <Card className="rounded-2xl shadow-sm">
          <CardContent>
            <ul className="divide-y">
              {Array.from({ length: DAILY_ROW_COUNT }, (_, index) => (
                <li key={index} className="flex items-center gap-2 py-2.5 sm:gap-3">
                  <Skeleton className="h-9 w-14 sm:w-20" />
                  <Skeleton className="h-5 flex-1" />
                  <Skeleton className="h-4 w-9 sm:w-12" />
                  <Skeleton className="h-4 w-16 sm:w-20" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
