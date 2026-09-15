'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { buildLocationHref } from '@/lib/location-params';
import { cn } from 'cn';
import type { WeatherLocation } from '@/types/weather';

interface LocationChipProps {
  location: WeatherLocation;
  /** 지정하면 칩 오른쪽에 삭제 버튼이 붙는다. */
  onRemove?: () => void;
  /** 삭제 버튼의 스크린 리더용 설명. */
  removeLabel?: string;
}

/**
 * 저장된 지역 하나를 나타내는 칩. 누르면 해당 지역 날씨로 이동한다.
 *
 * `Link`로 구현해 URL이 곧 지역 상태라는 규칙을 유지한다. 덕분에 서버에서 날씨를
 * 조회하고, 새 탭으로 열기 같은 브라우저 기본 동작도 그대로 동작한다.
 */
export function LocationChip({ location, onRemove, removeLabel }: LocationChipProps) {
  return (
    <span className="bg-muted/50 hover:bg-muted inline-flex max-w-full items-center rounded-full border transition-colors">
      <Link
        href={buildLocationHref(location)}
        className="focus-visible:ring-ring min-h-10 max-w-full truncate rounded-full py-2 pr-3 pl-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
      >
        {location.name}
      </Link>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring -ml-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
        >
          <X className="size-3.5" />
        </button>
      )}
    </span>
  );
}

interface LocationChipListProps {
  /** 섹션 제목. `id`를 만들어 `aria-labelledby`로 연결한다. */
  heading: string;
  headingId: string;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** 최근 조회와 즐겨찾기가 공유하는 섹션 껍데기. */
export function LocationChipList({
  heading,
  headingId,
  icon,
  className,
  children,
}: LocationChipListProps) {
  return (
    <section aria-labelledby={headingId} className={cn('space-y-3', className)}>
      <h2 id={headingId} className="flex items-center gap-2 text-xl font-semibold">
        {icon}
        {heading}
      </h2>
      <ul className="flex flex-wrap gap-2">{children}</ul>
    </section>
  );
}
