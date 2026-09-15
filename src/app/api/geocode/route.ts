import { searchLocations } from '@/lib/openweather';
import { getErrorMessage, OpenWeatherError } from '@/lib/weather-errors';
import type { WeatherLocation } from '@/types/weather';

/** 지역 검색 응답 본문. 클라이언트가 이 형태에 의존한다. */
export interface GeocodeResponseBody {
  locations: WeatherLocation[];
  /** 실패 시에만 채워지는 사용자 노출용 문구. */
  message?: string;
}

/**
 * 지역 검색 프록시.
 *
 * 자동완성은 사용자 입력에 실시간으로 반응해야 해서 이 프로젝트에서 유일하게
 * 브라우저가 호출하는 데이터 경로다. 그래도 OpenWeatherMap을 직접 부르지 않고
 * 이 핸들러를 거치게 해서 API 키를 서버에만 둔다.
 *
 * 실패 시 원본 에러 메시지를 내보내지 않는다. 메시지에 요청 URL이 섞여
 * API 키가 노출될 수 있기 때문이다.
 */
export async function GET(request: Request): Promise<Response> {
  const query = new URL(request.url).searchParams.get('q') ?? '';

  try {
    const locations = await searchLocations(query);
    return Response.json({ locations } satisfies GeocodeResponseBody);
  } catch (error) {
    const status = error instanceof OpenWeatherError && error.kind === 'rateLimited' ? 429 : 502;

    return Response.json(
      { locations: [], message: getErrorMessage(error) } satisfies GeocodeResponseBody,
      { status },
    );
  }
}
