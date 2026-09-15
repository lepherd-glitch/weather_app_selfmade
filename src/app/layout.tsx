import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { ThemeProvider } from '@/components/theme-provider';

import './globals.css';

/**
 * shadcn이 생성한 `globals.css`의 `@theme inline` 블록은 `--font-sans`와
 * `--font-geist-mono`를 참조한다. 폰트 로더의 CSS 변수명을 그에 맞춰야
 * `font-sans` / `font-mono` 유틸리티가 실제 폰트로 해석된다.
 */
const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Weatherly | 지역 기반 날씨',
  description: '원하는 지역의 현재 날씨와 시간별·일별 예보를 한눈에 확인하세요.',
};

/**
 * `viewportFit: 'cover'`는 노치·홈 인디케이터 영역까지 배경이 이어지게 한다.
 * 실제 콘텐츠는 헤더와 body에 `safe-area-inset` 패딩을 둬 가려지지 않게 한다.
 * `maximumScale`은 지정하지 않는다. 확대를 막으면 저시력 사용자가 글을 읽을 수 없다.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // `suppressHydrationWarning`은 next-themes 사용 시 필수다.
    // 테마 클래스를 하이드레이션 전에 주입하므로 서버/클라이언트 마크업이 의도적으로 달라진다.
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-clip pb-[env(safe-area-inset-bottom)]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
