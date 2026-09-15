'use client';

import { useSyncExternalStore } from 'react';

import {
  getLocationListSnapshot,
  getServerLocationListSnapshot,
  subscribeToLocationLists,
  type LocationListKind,
} from '@/lib/location-storage';
import type { WeatherLocation } from '@/types/weather';

/**
 * 저장된 지역 목록을 구독한다.
 *
 * `useEffect`로 localStorage를 읽어 상태에 넣는 방식이 흔하지만 두 가지 문제가 있다.
 * 하이드레이션 이후 한 번 더 렌더링이 일어나고, 여러 컴포넌트가 같은 목록을 보고 있을 때
 * 서로 어긋난다. `useSyncExternalStore`는 두 문제를 모두 React가 처리해 준다.
 */
export function useLocationList(kind: LocationListKind): readonly WeatherLocation[] {
  return useSyncExternalStore(
    subscribeToLocationLists,
    () => getLocationListSnapshot(kind),
    getServerLocationListSnapshot,
  );
}
