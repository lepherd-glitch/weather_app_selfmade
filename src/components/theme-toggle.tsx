'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/** 요구사항 명세서 14장의 테마 3단계. */
const THEME_OPTIONS = [
  { value: 'light', label: '라이트', icon: Sun },
  { value: 'dark', label: '다크', icon: Moon },
  { value: 'system', label: '시스템 설정', icon: Monitor },
] as const;

/**
 * 라이트 / 다크 / 시스템 테마 전환 버튼.
 *
 * 서버에서는 사용자의 테마를 알 수 없지만, 하이드레이션 가드가 필요하지 않다.
 * - 트리거의 해/달 아이콘은 `dark:` 변형으로 CSS가 전환하므로 서버와 클라이언트 마크업이 같다.
 * - `theme` 값을 읽는 라디오 그룹은 Radix Portal 안에 있어 드롭다운을 열기 전까지 렌더링되지 않는다.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="테마 변경" className="size-10 md:size-8">
          {/* 두 아이콘을 겹쳐두고 교차 전환해 아이콘 교체가 끊기지 않게 한다. */}
          <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <DropdownMenuRadioItem key={value} value={value} className="whitespace-nowrap">
              <Icon className="size-4" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
