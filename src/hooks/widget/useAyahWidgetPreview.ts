/* eslint-disable react-func/max-lines-per-function */
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';

import type { Preferences } from '@/components/AyahWidget/builder/types';
import { buildEmbedIframeConfig } from '@/components/AyahWidget/widget-config';

type UseAyahWidgetPreviewParams = {
  preferences: Preferences;
  translationIds: string;
};

/**
 * Manage the Ayah widget preview.
 *
 * What it does:
 * - Creates a fresh iframe inside the preview container.
 * - Uses /embed/v1 with the same params as the snippet.
 * - Updates the iframe whenever preferences change.
 *
 * @param {UseAyahWidgetPreviewParams} params - Preview configuration (preferences + translationIds).
 * @returns {MutableRefObject<HTMLDivElement | null>} Ref to attach to the preview container element.
 */
const useAyahWidgetPreview = ({
  preferences,
  translationIds,
}: UseAyahWidgetPreviewParams): {
  previewRef: MutableRefObject<HTMLDivElement | null>;
  isLoading: boolean;
} => {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const RESIZE_MESSAGE = 'quran-embed:resize';
  const REQUEST_MESSAGE = 'quran-embed:request-resize';

  const iframeConfig = useMemo(
    () => buildEmbedIframeConfig(preferences, translationIds),
    [preferences, translationIds],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (!previewRef.current) return undefined;

    const containerEl: HTMLDivElement = previewRef.current;
    containerEl.replaceChildren();

    const iframe = document.createElement('iframe');
    setIsLoading(true);
    iframe.src = iframeConfig.src;
    iframe.width = iframeConfig.widthValue;
    if (iframeConfig.heightValue) {
      iframe.height = iframeConfig.heightValue;
      iframe.style.maxHeight = iframeConfig.heightValue;
    }
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'clipboard-write');
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('title', 'Quran.com embed preview');
    iframe.style.border = '0';
    iframe.style.borderRadius = '12px';
    iframe.style.maxWidth = '100%';
    iframe.style.display = 'block';

    // Set loading state when iframe is loaded or fails to load.
    const handleLoaded = () => setIsLoading(false);
    // Handle resize messages from the iframe.
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      if (!event.data || typeof event.data !== 'object') return;
      const { type, height } = event.data as { type?: unknown; height?: unknown };
      if (type !== RESIZE_MESSAGE) return;
      const nextHeight = Number(height);
      if (!Number.isFinite(nextHeight) || nextHeight <= 0) return;
      const heightValue = `${Math.ceil(nextHeight)}px`;
      iframe.style.height = heightValue;
      iframe.setAttribute('height', heightValue);
    };
    const requestResize = () => {
      if (!iframe.contentWindow) return;
      iframe.contentWindow.postMessage({ type: REQUEST_MESSAGE }, '*');
    };

    iframe.addEventListener('load', handleLoaded);
    iframe.addEventListener('error', handleLoaded);
    iframe.addEventListener('load', requestResize);
    window.addEventListener('message', handleMessage);
    window.addEventListener('resize', requestResize);

    containerEl.appendChild(iframe);
    requestResize();

    // Cleanup event listeners.
    return () => {
      iframe.removeEventListener('load', handleLoaded);
      iframe.removeEventListener('error', handleLoaded);
      iframe.removeEventListener('load', requestResize);
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('resize', requestResize);
    };
  }, [iframeConfig]);

  return { previewRef, isLoading };
};

export default useAyahWidgetPreview;
