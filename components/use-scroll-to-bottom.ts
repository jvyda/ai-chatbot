import { useEffect, useRef, type RefObject } from 'react';

interface ScrollOptions {
  shouldScroll?: (prevMessages: any[], newMessages: any[]) => boolean;
}

export function useScrollToBottom<T extends HTMLElement>(options?: ScrollOptions) {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);

  useEffect(() => {
    if (!options?.shouldScroll || options.shouldScroll([], [])) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [options]);

  return [containerRef, endRef] as const;
}
