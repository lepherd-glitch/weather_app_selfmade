import { Suspense } from 'react';

import { CurrentWeather } from '@/components/current-weather';
import { FavoriteLocations } from '@/components/favorite-locations';
import { Header } from '@/components/header';
import { HourlyForecast } from '@/components/hourly-forecast';
import { LocationSearch } from '@/components/location-search';
import { RecentLocationRecorder } from '@/components/recent-location-recorder';
import { RecentLocations } from '@/components/recent-locations';
import { WeatherDetailGrid } from '@/components/weather-detail-grid';
import { WeatherErrorBoundary } from '@/components/weather-error-boundary';
import { WeatherErrorState } from '@/components/weather-error-state';
import { WeatherSkeleton } from '@/components/weather-skeleton';
import { WeeklyForecast } from '@/components/weekly-forecast';
import { parseLocationParams } from '@/lib/location-params';
import { getWeatherSnapshot } from '@/lib/openweather';
import { getErrorMessage, isRetryable } from '@/lib/weather-errors';
import type { WeatherLocation, WeatherSnapshot } from '@/types/weather';

/**
 * 메인 페이지. 요구사항 명세서 21장의 구조를 따른다.
 *
 * 선택된 지역은 URL 검색 파라미터에서 읽는다. 덕분에 날씨 조회가 전부 서버에서
 * 일어나 API 키가 브라우저로 나가지 않고, 지역별 URL을 공유할 수도 있다.
 */
export default async function Page({ searchParams }: PageProps<'/'>) {
  const location = parseLocationParams(await searchParams);

  return (
    <>
      <Header>
        <LocationSearch />
      </Header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6">
        {/* 예상 밖의 렌더링 오류를 이 안쪽에서만 막는다. 헤더가 살아 있어야
            사용자가 다른 지역을 검색해 스스로 빠져나올 수 있다. */}
        <WeatherErrorBoundary>
          {/* 좌표를 key로 두면 지역이 바뀔 때 경계가 다시 suspend되어 스켈레톤이 보인다.
              key가 없으면 새 데이터가 도착할 때까지 이전 지역 날씨가 그대로 남아 혼란스럽다. */}
          <Suspense
            key={`${location.latitude},${location.longitude}`}
            fallback={<WeatherSkeleton />}
          >
            <WeatherSections location={location} />
          </Suspense>
        </WeatherErrorBoundary>
      </main>
    </>
  );
}

/**
 * 날씨 데이터에 의존하는 영역. Suspense 경계 안에서 스트리밍된다.
 *
 * API 실패는 예상 가능한 오류이므로 throw하지 않고 여기서 직접 화면으로 만든다.
 * Next.js는 프로덕션에서 Server Component의 에러 메시지를 가리기 때문에,
 * 오류를 Boundary로 올려보내면 분류별 한국어 안내를 전달할 수 없다.
 */
async function WeatherSections({ location }: { location: WeatherLocation }) {
  let snapshot: WeatherSnapshot;

  try {
    snapshot = await getWeatherSnapshot(location);
  } catch (error) {
    return (
      <div className="space-y-8">
        <WeatherErrorState
          description={getErrorMessage(error)}
          canRetry={isRetryable(error)}
        />
        {/* 저장된 목록은 그대로 보여준다. 다른 지역으로 옮겨 가는 것이 가장 빠른 복구다.
            실패한 지역은 최근 조회에 기록하지 않는다. */}
        <FavoriteLocations />
        <RecentLocations />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CurrentWeather weather={snapshot.current} location={snapshot.location} />
      <WeatherDetailGrid weather={snapshot.current} airQuality={snapshot.airQuality} />
      <HourlyForecast current={snapshot.current} hourly={snapshot.hourly} />
      <WeeklyForecast
        daily={snapshot.daily}
        timezoneOffset={snapshot.current.timezoneOffset}
        observedAt={snapshot.current.observedAt}
      />
      <FavoriteLocations />
      <RecentLocations />
      <RecentLocationRecorder location={snapshot.location} />
    </div>
  );
}
