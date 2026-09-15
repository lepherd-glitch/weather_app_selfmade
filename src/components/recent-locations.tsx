'use client';

import { History } from 'lucide-react';

import { LocationChip, LocationChipList } from '@/components/location-chip';
import { useLocationList } from '@/hooks/use-location-list';

/**
 * 요구사항 명세서 10장의 최근 조회 지역.
 *
 * 저장된 목록이 없으면 아무것도 그리지 않는다. 서버 렌더링 시점에는 localStorage를
 * 읽을 수 없어 항상 빈 목록이므로, 첫 방문자는 이 영역을 보지 않는다.
 */
export function RecentLocations() {
  const recentLocations = useLocationList('recent');

  if (recentLocations.length === 0) return null;

  return (
    <LocationChipList
      heading="최근 조회"
      headingId="recent-locations-heading"
      icon={<History className="text-muted-foreground size-5" aria-hidden />}
    >
      {recentLocations.map((location) => (
        <li key={`${location.latitude},${location.longitude}`}>
          <LocationChip location={location} />
        </li>
      ))}
    </LocationChipList>
  );
}
