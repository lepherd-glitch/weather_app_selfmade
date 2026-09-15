'use client';

import { Loader2, MapPin, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { GeocodeResponseBody } from '@/app/api/geocode/route';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { buildLocationHref } from '@/lib/location-params';
import type { WeatherLocation } from '@/types/weather';

/** 입력이 멎은 뒤 조회까지의 대기 시간(ms). */
const SEARCH_DEBOUNCE_MS = 300;

/** 한 글자 검색은 결과가 과도하게 넓어 최소 길이를 둔다. */
const MIN_QUERY_LENGTH = 2;

/**
 * 한 번의 검색 결과. 어떤 검색어에 대한 응답인지 함께 담는다.
 *
 * `query`를 같이 들고 있으면 현재 검색어와 비교하는 것만으로 조회 중 여부를 알 수 있어
 * 별도의 로딩 상태가 필요 없고, 다른 검색어의 결과가 화면에 남는 일도 없다.
 */
interface SearchOutcome {
  query: string;
  locations: WeatherLocation[];
  /** 실패했을 때만 채워지는 안내 문구. */
  errorMessage: string | null;
}

/**
 * 요구사항 명세서 5장의 지역 검색.
 *
 * 선택한 지역은 컴포넌트 상태가 아니라 URL로 올린다. 그러면 Server Component가
 * 서버에서 날씨를 조회하므로 API 키가 브라우저로 나가지 않고, 전역 상태 관리도
 * 필요 없어진다.
 */
export function LocationSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [outcome, setOutcome] = useState<SearchOutcome | null>(null);

  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const shouldSearch = debouncedQuery.length >= MIN_QUERY_LENGTH;

  // 현재 검색어의 결과가 아직 없으면 조회 중이다.
  const settledOutcome = outcome?.query === debouncedQuery ? outcome : null;
  const isSearching = shouldSearch && settledOutcome === null;
  const results = settledOutcome?.locations ?? [];

  useEffect(() => {
    if (!shouldSearch) return;

    // 느린 응답이 나중에 도착해 최신 결과를 덮어쓰는 것을 막는다.
    // 검색어가 바뀌면 이전 요청을 취소하고, 취소된 요청의 응답은 반영하지 않는다.
    const abortController = new AbortController();

    const search = async () => {
      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(debouncedQuery)}`, {
          signal: abortController.signal,
        });
        const body = (await response.json()) as GeocodeResponseBody;

        setOutcome({
          query: debouncedQuery,
          locations: response.ok ? body.locations : [],
          errorMessage: response.ok ? null : body.message ?? '지역을 검색하지 못했습니다.',
        });
      } catch {
        // 취소로 인한 실패는 새 검색이 진행 중이라는 뜻이므로 무시한다.
        if (abortController.signal.aborted) return;

        setOutcome({
          query: debouncedQuery,
          locations: [],
          errorMessage: '인터넷 연결 상태를 확인해주세요.',
        });
      }
    };

    void search();

    return () => abortController.abort();
  }, [debouncedQuery, shouldSearch]);

  const handleSelect = (location: WeatherLocation) => {
    setIsOpen(false);
    setQuery('');
    router.push(buildLocationHref(location));
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-10 w-full justify-start md:h-7 md:w-auto md:justify-center"
      >
        <Search className="size-4" />
        지역 검색
      </Button>

      <CommandDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="지역 검색"
        description="도시 또는 지역명을 입력해 날씨를 조회합니다."
        className="max-sm:top-4 max-sm:max-w-[calc(100%-1.5rem)]"
      >
        {/* 검색은 서버에서 수행하므로 cmdk의 클라이언트 필터링을 끈다.
            켜두면 API가 돌려준 결과를 입력 문자열로 한 번 더 걸러 정상 결과가 사라진다. */}
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="지역을 검색하세요"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <SearchStatus
              shouldSearch={shouldSearch}
              isSearching={isSearching}
              errorMessage={settledOutcome?.errorMessage ?? null}
              resultCount={results.length}
            />

            {results.map((location) => (
              <CommandItem
                // 좌표까지 포함해야 이름이 같은 다른 지역과 키가 충돌하지 않는다.
                key={`${location.latitude},${location.longitude}`}
                value={`${location.latitude},${location.longitude}`}
                onSelect={() => handleSelect(location)}
              >
                <MapPin className="size-4" />
                {/* 지역명 길이는 API가 정하므로 좁은 화면에서 넘칠 수 있다.
                    이름을 줄여서 국가 코드가 항상 보이게 한다. 같은 이름의 다른 지역을
                    구분하는 단서가 뒤쪽 정보이기 때문이다. */}
                <span className="truncate">{location.name}</span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {[location.region, location.countryCode].filter(Boolean).join(', ')}
                </span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}

interface SearchStatusProps {
  shouldSearch: boolean;
  isSearching: boolean;
  errorMessage: string | null;
  resultCount: number;
}

/** 입력 안내 / 조회 중 / 오류 / 결과 없음 중 상황에 맞는 하나만 보여준다. */
function SearchStatus({
  shouldSearch,
  isSearching,
  errorMessage,
  resultCount,
}: SearchStatusProps) {
  if (!shouldSearch) {
    return (
      <CommandEmpty>{MIN_QUERY_LENGTH}글자 이상 입력하면 지역을 찾아드립니다.</CommandEmpty>
    );
  }

  if (isSearching) {
    return (
      <CommandEmpty className="flex items-center justify-center gap-2">
        <Loader2 className="size-4 animate-spin" />
        검색 중...
      </CommandEmpty>
    );
  }

  if (errorMessage) {
    return <CommandEmpty className="text-destructive">{errorMessage}</CommandEmpty>;
  }

  if (resultCount === 0) {
    return <CommandEmpty>검색 결과가 없습니다. 다른 지역명을 입력해주세요.</CommandEmpty>;
  }

  return null;
}
