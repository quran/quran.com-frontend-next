/* eslint-disable react-func/max-lines-per-function */
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';

import type { Preferences } from '@/components/AyahWidget/builder/types';
import { buildWidgetScriptAttributes } from '@/components/AyahWidget/widget-config';

const PREVIEW_SCRIPT_SRC = '/embed/quran-embed.js';

type UseAyahWidgetPreviewParams = {
  preferences: Preferences;
  translationIds: string;
};

/**
 * Manage the Ayah widget preview.
 *
 * What it does:
 * - Creates a fresh target <div> inside the preview container.
 * - Applies width/height based on preferences.
 * - Injects the embed <script> with `data-quran-allow-rerender=true` so the widget can re-render.
 * - Cleans up the injected <script> on unmount or when configuration changes.
 *
 * Important:
 * - This hook injects a new <script> tag when relevant preferences change.
 * - The embed script is expected to dedupe renders unless allow-rerender is enabled.
 *
 * @param {UseAyahWidgetPreviewParams} params - Preview configuration (preferences + translationIds).
 * @returns {MutableRefObject<HTMLDivElement | null>} Ref to attach to the preview container element.
 */
const useAyahWidgetPreview = ({
  preferences,
  translationIds,
}: UseAyahWidgetPreviewParams): MutableRefObject<HTMLDivElement | null> => {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // We pass the current origin to the embed script so it can call our local API in preview.
  const [previewOrigin, setPreviewOrigin] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setPreviewOrigin(window.location.origin);
  }, []);

  /**
   * Build the script attributes + resolved sizing once per relevant change.
   * This keeps the main effect easier to read.
   */
  const widgetBuild = useMemo(() => {
    const { attributes, widthValue, heightValue } = buildWidgetScriptAttributes(
      preferences,
      translationIds,
      { origin: previewOrigin },
    );

    return {
      attributes,
      widthValue,
      heightValue,
    };
  }, [preferences, translationIds, previewOrigin]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (!previewRef.current) return undefined;
    if (!previewOrigin) return undefined; // wait until origin is known

    const containerEl: HTMLDivElement = previewRef.current;

    /* ----------------------- Reset preview container markup ----------------------- */
    containerEl.replaceChildren();

    // Widget target element (the embed script will render inside it).
    const targetEl: HTMLDivElement = document.createElement('div');
    targetEl.id = preferences.containerId;
    targetEl.style.width = widgetBuild.widthValue;
    targetEl.style.maxWidth = '100%';
    targetEl.style.display = 'block';

    if (widgetBuild.heightValue) {
      targetEl.style.height = widgetBuild.heightValue;
    } else {
      targetEl.style.removeProperty('height');
    }

    containerEl.appendChild(targetEl);

    /* ----------------------------- Inject embed script ---------------------------- */
    const scriptEl: HTMLScriptElement = document.createElement('script');
    scriptRef.current = scriptEl;

    scriptEl.src = PREVIEW_SCRIPT_SRC;
    scriptEl.async = true;

    // Allow the preview to re-render without a full page reload.
    scriptEl.setAttribute('data-quran-allow-rerender', 'true');

    widgetBuild.attributes.forEach(([key, value]) => {
      scriptEl.setAttribute(key, value);
    });

    document.body.appendChild(scriptEl);

    /* ---------------------------------- Cleanup ---------------------------------- */
    return () => {
      const existingScript: HTMLScriptElement | null = scriptRef.current;
      if (existingScript?.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
      scriptRef.current = null;
    };
  }, [preferences.containerId, previewOrigin, widgetBuild]);

  return previewRef;
};

export default useAyahWidgetPreview;
