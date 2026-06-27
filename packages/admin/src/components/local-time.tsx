'use client';

import { useEffect, useState } from 'react';

// The gym is in Almaty — use that TZ for SSR so admins in Almaty (the typical
// case) see no flash on hydration. Client-side effect then re-renders in the
// browser's actual TZ for anyone elsewhere.
const ADMIN_TZ = 'Asia/Almaty';

type Variant = 'datetime' | 'date';

function formatIn(iso: string, tz: string | undefined, variant: Variant): string {
  const d = new Date(iso);
  const opts: Intl.DateTimeFormatOptions =
    variant === 'date'
      ? { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: tz }
      : { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: tz };
  return d.toLocaleString('ru-RU', opts);
}

export function LocalTime({ iso, variant = 'datetime' }: { iso: string; variant?: Variant }) {
  const [text, setText] = useState(() => formatIn(iso, ADMIN_TZ, variant));
  useEffect(() => {
    setText(formatIn(iso, undefined, variant));
  }, [iso, variant]);
  return <span suppressHydrationWarning>{text}</span>;
}
