import type { LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

interface WeatherDetailCardProps {
  icon: LucideIcon;
  label: string;
  /** 표시할 수치. 값이 없으면 `null`을 넘겨 "-"로 표기한다. */
  value: string | null;
  /** 단위나 등급처럼 수치를 보조하는 짧은 설명. */
  caption?: string;
}

/** 요구사항 명세서 7장의 상세 날씨 카드 한 칸. */
export function WeatherDetailCard({
  icon: Icon,
  label,
  value,
  caption,
}: WeatherDetailCardProps) {
  return (
    <Card size="sm" className="rounded-2xl shadow-sm">
      <CardContent className="flex flex-col gap-2">
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Icon className="size-3.5" aria-hidden />
          <span>{label}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-semibold tracking-tight">{value ?? '-'}</span>
          {caption && <span className="text-muted-foreground text-xs">{caption}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
