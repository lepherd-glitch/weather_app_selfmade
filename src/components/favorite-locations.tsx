'use client';

import { Star } from 'lucide-react';

import { LocationChip, LocationChipList } from '@/components/location-chip';
import { useLocationList } from '@/hooks/use-location-list';
import { removeFavoriteLocation } from '@/lib/location-storage';

/**
 * 요구사항 명세서 11장의 즐겨찾기 지역.
 *
 * 각 칩에 삭제 버튼을 둔다. 별표 버튼은 현재 보고 있는 지역만 토글할 수 있어서,
 * 삭제 버튼이 없으면 다른 지역을 해제하려고 그 지역으로 이동해야 한다.
 */
export function FavoriteLocations() {
  const favoriteLocations = useLocationList('favorite');

  if (favoriteLocations.length === 0) return null;

  return (
    <LocationChipList
      heading="즐겨찾기"
      headingId="favorite-locations-heading"
      icon={<Star className="text-muted-foreground size-5" aria-hidden />}
    >
      {favoriteLocations.map((location) => (
        <li key={`${location.latitude},${location.longitude}`}>
          <LocationChip
            location={location}
            onRemove={() => removeFavoriteLocation(location)}
            removeLabel={`${location.name} 즐겨찾기 해제`}
          />
        </li>
      ))}
    </LocationChipList>
  );
}
