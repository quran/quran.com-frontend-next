import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';

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
}: UseAyahWidgetPreviewParams): MutableRefObject<HTMLDivElement | null> => {
  const previewRef = useRef<HTMLDivElement | null>(null);

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
    iframe.src = iframeConfig.src;
    iframe.width = iframeConfig.widthValue;
    iframe.height = iframeConfig.heightValue;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('title', 'Quran.com embed preview');
    iframe.style.border = '0';
    iframe.style.borderRadius = '12px';
    iframe.style.maxWidth = '100%';
    iframe.style.display = 'block';

    containerEl.appendChild(iframe);

    return undefined;
  }, [iframeConfig]);

  return previewRef;
};

export default useAyahWidgetPreview;
