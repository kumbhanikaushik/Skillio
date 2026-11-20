import { useEffect, useState } from 'react';

/** Ticks every second from `minutes` down to 0. Returns zero-padded h / m / s. */
export function useCountdown(minutes: number) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const left = Math.max(minutes * 60 - elapsed, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return { h: pad(Math.floor(left / 3600)), m: pad(Math.floor((left % 3600) / 60)), s: pad(left % 60), done: left === 0 };
}
