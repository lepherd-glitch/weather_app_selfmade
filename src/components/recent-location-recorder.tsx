'use client';

import { useEffect } from 'react';

import { recordRecentLocation } from '@/lib/location-storage';
import type { WeatherLocation } from '@/types/weather';

interface RecentLocationRecorderProps {
  location: WeatherLocation;
}

/**
 * 현재 보고 있는 지역을 최근 조회 목록에 기록한다. 화면에는 아무것도 그리지 않는다.
 *
 * 검색으로 선택한 순간이 아니라 실제로 날씨를 본 시점에 기록한다. 그래야 공유받은
 * URL로 들어온 지역과 기본 지역도 목록에 남아, 명세서 9장의 흐름과 일치한다.
 *
 * localStorage 쓰기는 React 외부 시스템을 갱신하는 작업이므로 `useEffect`가 맞는 자리다.
 */
export function RecentLocationRecorder({ location }: RecentLocationRecorderProps) {
  const { name, countryCode, region, latitude, longitude } = location;

  // 객체가 아닌 개별 값을 의존성으로 쓴다. 서버 컴포넌트가 넘기는 prop은 렌더마다
  // 새 객체라서, 객체를 그대로 두면 내용이 같아도 매 렌더 효과가 다시 실행된다.
  useEffect(() => {
    recordRecentLocation({ name, countryCode, region, latitude, longitude });
  }, [name, countryCode, region, latitude, longitude]);

  return null;
}
