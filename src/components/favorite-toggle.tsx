'use client';

import { Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLocationList } from '@/hooks/use-location-list';
import { isSameLocation, LIST_LIMITS, toggleFavoriteLocation } from '@/lib/location-storage';
import { cn } from 'cn';
import type { WeatherLocation } from '@/types/weather';

interface FavoriteToggleProps {
  location: WeatherLocation;
}

/**
 * 요구사항 명세서 11장의 별표 버튼. 현재 보고 있는 지역을 즐겨찾기에 넣거나 뺀다.
 *
 * 목록이 상한에 닿으면 `disabled` 대신 `aria-disabled`를 쓴다. `disabled` 버튼은
 * 포커스와 마우스 이벤트를 받지 못해 왜 누를 수 없는지 설명할 방법이 없어진다.
 */
export function FavoriteToggle({ location }: FavoriteToggleProps) {
  const favoriteLocations = useLocationList('favorite');

  const isFavorite = favoriteLocations.some((item) => isSameLocation(item, location));
  const isLimitReached = !isFavorite && favoriteLocations.length >= LIST_LIMITS.favorite;

  const label = isLimitReached
    ? `즐겨찾기는 최대 ${LIST_LIMITS.favorite}개까지 저장할 수 있습니다`
    : isFavorite
      ? `${location.name} 즐겨찾기 해제`
      : `${location.name} 즐겨찾기 등록`;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      aria-pressed={isFavorite}
      aria-disabled={isLimitReached}
      onClick={() => {
        if (isLimitReached) return;
        toggleFavoriteLocation(location);
      }}
      className={cn('size-10 md:size-7', isLimitReached && 'opacity-50')}
    >
      <Star
        className={cn('size-5', isFavorite && 'fill-amber-400 text-amber-400')}
        aria-hidden
      />
    </Button>
  );
}
