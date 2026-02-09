/* eslint-disable consistent-return */
/* eslint-disable react-func/max-lines-per-function */
import { useEffect, type RefObject } from 'react';

const RESIZE_MESSAGE = 'quran-embed:resize';
const REQUEST_MESSAGE = 'quran-embed:request-resize';

const getContentHeight = (target?: HTMLElement | null): number => {
  if (typeof document === 'undefined') return 0;

  if (target) {
    const rectHeight = target.getBoundingClientRect().height;
    return Math.max(target.scrollHeight, target.offsetHeight, rectHeight);
  }

  const { body } = document;
  const html = document.documentElement;

  return Math.max(
    body?.scrollHeight ?? 0,
    body?.offsetHeight ?? 0,
    body?.clientHeight ?? 0,
    html?.scrollHeight ?? 0,
    html?.offsetHeight ?? 0,
    html?.clientHeight ?? 0,
  );
};

const useEmbedAutoResize = (targetRef: RefObject<HTMLElement>): void => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.parent === window) return;

    let rafId: number | null = null;

    const sendHeight = () => {
      const height = getContentHeight(targetRef.current);
      if (height <= 0) return;
      window.parent.postMessage({ type: RESIZE_MESSAGE, height }, '*');
    };

    const scheduleSend = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        sendHeight();
      });
    };

    const target = targetRef.current ?? document.body;

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      if (!event.data || typeof event.data !== 'object') return;
      const { type } = event.data as { type?: unknown };
      if (type !== REQUEST_MESSAGE) return;
      scheduleSend();
    };

    const onResize = () => scheduleSend();

    scheduleSend();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && target) {
      resizeObserver = new ResizeObserver(() => scheduleSend());
      resizeObserver.observe(target);
    }

    window.addEventListener('message', onMessage);
    window.addEventListener('load', onResize);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('message', onMessage);
      window.removeEventListener('load', onResize);
      window.removeEventListener('resize', onResize);
      if (resizeObserver) resizeObserver.disconnect();
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [targetRef]);
};

export default useEmbedAutoResize;
