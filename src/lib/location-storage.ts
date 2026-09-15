/**
 * 최근 조회 지역과 즐겨찾기의 localStorage 저장 계층.
 *
 * React의 외부 저장소(external store)로 동작한다. 컴포넌트가 localStorage를 직접
 * 읽지 않고 이 모듈을 거치는 이유는 두 가지다.
 *
 * 1. 하이드레이션. 서버는 localStorage를 볼 수 없으므로 첫 렌더는 반드시 빈 목록이어야
 *    한다. `getServerLocationListSnapshot`이 그 역할을 하고, React가 하이드레이션을
 *    마친 뒤 실제 값으로 교체한다.
 * 2. 동기화. 한 화면에 즐겨찾기 목록과 별표 버튼이 동시에 존재하므로, 한쪽에서 바꾼
 *    내용이 다른 쪽에 즉시 반영되어야 한다. 구독 기반으로 두면 자동으로 맞춰진다.
 *
 * @see https://react.dev/reference/react/useSyncExternalStore
 */

import type { WeatherLocation } from '@/types/weather';

/** 스키마가 바뀌면 접미사를 올려 과거 데이터를 무시한다. */
const STORAGE_KEYS = {
  recent: 'weatherly.recent-locations.v1',
  favorite: 'weatherly.favorite-locations.v1',
} as const;

export type LocationListKind = keyof typeof STORAGE_KEYS;

/** 요구사항 명세서 10·11장의 저장 개수 상한. */
export const LIST_LIMITS: Record<LocationListKind, number> = {
  recent: 5,
  favorite: 10,
};

/**
 * 서버 렌더링과 하이드레이션 첫 렌더가 공유하는 빈 목록.
 *
 * 매번 새 배열을 반환하면 `useSyncExternalStore`가 값이 계속 바뀐다고 판단해
 * 무한 렌더링에 빠진다. 반드시 같은 참조를 돌려줘야 한다.
 */
const EMPTY_LIST: readonly WeatherLocation[] = Object.freeze([]);

/** 파싱 결과 캐시. 저장소가 바뀔 때만 비운다. 참조 안정성을 위해 반드시 필요하다. */
const snapshotCache = new Map<LocationListKind, readonly WeatherLocation[]>();

const listeners = new Set<() => void>();

/* ------------------------------------------------------------------ */
/* 읽기                                                               */
/* ------------------------------------------------------------------ */

/**
 * localStorage에서 읽은 값이 쓸 수 있는 지역 정보인지 검증한다.
 *
 * localStorage는 사용자가 직접 편집할 수 있고 과거 버전이 남아 있을 수도 있다.
 * 좌표는 그대로 OpenWeatherMap 요청에 실리므로 범위까지 확인한다.
 */
function isWeatherLocation(value: unknown): value is WeatherLocation {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.name === 'string' &&
    candidate.name.length > 0 &&
    typeof candidate.countryCode === 'string' &&
    typeof candidate.latitude === 'number' &&
    Number.isFinite(candidate.latitude) &&
    Math.abs(candidate.latitude) <= 90 &&
    typeof candidate.longitude === 'number' &&
    Number.isFinite(candidate.longitude) &&
    Math.abs(candidate.longitude) <= 180
  );
}

function readFromStorage(kind: LocationListKind): readonly WeatherLocation[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS[kind]);
    if (!raw) return EMPTY_LIST;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_LIST;

    const valid = parsed.filter(isWeatherLocation).slice(0, LIST_LIMITS[kind]);
    return valid.length > 0 ? valid : EMPTY_LIST;
  } catch {
    // JSON 파싱 실패, 또는 사파리 프라이빗 모드처럼 localStorage 접근 자체가 막힌 경우.
    // 저장 기능만 조용히 포기하고 화면은 정상 동작하게 둔다.
    return EMPTY_LIST;
  }
}

/** `useSyncExternalStore`의 `getSnapshot`. 저장소가 바뀌지 않으면 같은 참조를 돌려준다. */
export function getLocationListSnapshot(kind: LocationListKind): readonly WeatherLocation[] {
  const cached = snapshotCache.get(kind);
  if (cached) return cached;

  const list = readFromStorage(kind);
  snapshotCache.set(kind, list);
  return list;
}

/** `useSyncExternalStore`의 `getServerSnapshot`. 서버에는 저장된 목록이 없다. */
export function getServerLocationListSnapshot(): readonly WeatherLocation[] {
  return EMPTY_LIST;
}

/* ------------------------------------------------------------------ */
/* 구독                                                               */
/* ------------------------------------------------------------------ */

/** 다른 탭에서 목록을 바꾼 경우를 반영한다. 같은 탭 변경은 쓰기 함수가 직접 알린다. */
function handleExternalChange(event: StorageEvent) {
  const isOurKey = Object.values(STORAGE_KEYS).some((key) => key === event.key);

  // key가 null이면 저장소 전체가 비워진 것이므로 함께 반영한다.
  if (event.key !== null && !isOurKey) return;

  snapshotCache.clear();
  notifyListeners();
}

export function subscribeToLocationLists(listener: () => void): () => void {
  if (listeners.size === 0) {
    window.addEventListener('storage', handleExternalChange);
  }

  listeners.add(listener);

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      window.removeEventListener('storage', handleExternalChange);
    }
  };
}

function notifyListeners() {
  for (const listener of listeners) listener();
}

/* ------------------------------------------------------------------ */
/* 쓰기                                                               */
/* ------------------------------------------------------------------ */

function writeToStorage(kind: LocationListKind, locations: readonly WeatherLocation[]) {
  const limited = locations.slice(0, LIST_LIMITS[kind]);

  try {
    window.localStorage.setItem(STORAGE_KEYS[kind], JSON.stringify(limited));
  } catch {
    // 용량 초과나 접근 차단. 캐시를 갱신하지 않아 화면은 기존 상태를 유지한다.
    return;
  }

  snapshotCache.set(kind, limited.length > 0 ? limited : EMPTY_LIST);
  notifyListeners();
}

/**
 * 같은 지역인지 좌표로 판별한다.
 *
 * 지역명은 언어와 표기에 따라 달라질 수 있어(`Seoul` / `서울특별시`) 기준으로 쓰지 않는다.
 * 좌표는 Geocoding API가 지역마다 고정된 값을 내려주므로 안정적인 식별자다.
 */
export function isSameLocation(a: WeatherLocation, b: WeatherLocation): boolean {
  return a.latitude === b.latitude && a.longitude === b.longitude;
}

/**
 * 최근 조회 목록의 맨 앞에 지역을 올린다. 이미 있으면 순서만 끌어올린다.
 *
 * 페이지를 볼 때마다 호출되므로, 이미 맨 앞이면 쓰기를 건너뛰어 불필요한
 * 리렌더링을 막는다.
 */
export function recordRecentLocation(location: WeatherLocation): void {
  const current = getLocationListSnapshot('recent');

  if (current[0] && isSameLocation(current[0], location)) return;

  writeToStorage('recent', [
    location,
    ...current.filter((item) => !isSameLocation(item, location)),
  ]);
}

/** 즐겨찾기 토글 결과. 상한에 걸려 등록되지 않은 경우를 호출자가 구분할 수 있게 한다. */
export type FavoriteToggleResult = 'added' | 'removed' | 'limitReached';

export function toggleFavoriteLocation(location: WeatherLocation): FavoriteToggleResult {
  const current = getLocationListSnapshot('favorite');

  if (current.some((item) => isSameLocation(item, location))) {
    writeToStorage(
      'favorite',
      current.filter((item) => !isSameLocation(item, location)),
    );
    return 'removed';
  }

  if (current.length >= LIST_LIMITS.favorite) return 'limitReached';

  writeToStorage('favorite', [...current, location]);
  return 'added';
}

export function removeFavoriteLocation(location: WeatherLocation): void {
  const current = getLocationListSnapshot('favorite');

  writeToStorage(
    'favorite',
    current.filter((item) => !isSameLocation(item, location)),
  );
}
