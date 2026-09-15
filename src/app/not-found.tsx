import { MapPinOff } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

/** 존재하지 않는 경로로 접근한 경우. 기본 404 화면이 영어라서 직접 제공한다. */
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 md:px-6">
      <section className="flex w-full flex-col items-center gap-4 py-16 text-center">
        <div className="bg-muted rounded-full p-4">
          <MapPinOff className="text-muted-foreground size-8" aria-hidden />
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-semibold">페이지를 찾을 수 없습니다.</h1>
          <p className="text-muted-foreground text-sm">
            주소가 바뀌었거나 삭제된 페이지일 수 있습니다.
          </p>
        </div>

        <Button asChild>
          <Link href="/">날씨 홈으로</Link>
        </Button>
      </section>
    </main>
  );
}
