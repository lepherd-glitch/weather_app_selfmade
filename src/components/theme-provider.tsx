'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ComponentProps } from 'react';

/**
 * 앱 전역 테마 공급자. 요구사항 명세서 14장의 Light / Dark / System 3단계를 지원한다.
 *
 * next-themes가 `<html>`에 `dark` 클래스를 붙이고, `globals.css`의
 * `@custom-variant dark (&:is(.dark *))`가 이를 Tailwind 다크 변형으로 연결한다.
 *
 * `disableTransitionOnChange`는 테마 전환 순간 모든 요소의 transition을 잠시 끊어
 * 색상이 어긋나게 번지는 현상을 막는다.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
