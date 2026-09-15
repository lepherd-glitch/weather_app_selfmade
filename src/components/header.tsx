import { CloudSun } from 'lucide-react';
import type { ReactNode } from 'react';

import { ThemeToggle } from '@/components/theme-toggle';

interface HeaderProps {
  /**
   * 지역 검색 UI를 끼워 넣는 슬롯.
   * 검색은 클라이언트 상호작용이 필요하므로, Header 자체는 서버 컴포넌트로 유지하고
   * 상호작용이 필요한 부분만 주입받는다.
   */
  children?: ReactNode;
}

/**
 * 요구사항 명세서 4장·18장의 서비스 헤더.
 *
 * 데스크톱은 한 줄(로고 · 검색 · 테마)이고, 모바일은 명세대로 검색을 아래 독립 행에 둔다.
 * 한 줄에 우겨 넣으면 검색 버튼이 28px까지 줄어 손가락으로 누르기 어렵다.
 */
export function Header({ children }: HeaderProps) {
  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b pt-[env(safe-area-inset-top)] backdrop-blur-sm">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 px-4 py-3 md:flex md:h-16 md:gap-4 md:px-6 md:py-0">
        <div className="flex min-w-0 items-center gap-2">
          <CloudSun className="text-primary size-6 shrink-0" aria-hidden />
          <span className="truncate text-lg font-semibold tracking-tight">Weatherly</span>
        </div>

        <div className="md:order-last">
          <ThemeToggle />
        </div>

        <div className="col-span-2 md:ml-auto">{children}</div>
      </div>
    </header>
  );
}
