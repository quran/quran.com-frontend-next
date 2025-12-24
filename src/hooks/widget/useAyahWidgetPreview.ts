/* eslint-disable react-func/max-lines-per-function */
import { useEffect, useRef, useState, type MutableRefObject } from 'react';

import type { Preferences } from '@/components/AyahWidget/builder/types';

const PREVIEW_SCRIPT_SRC = '/embed/quran-embed.js';

interface UseAyahWidgetPreviewParams {
  preferences: Preferences;
  translationIds: string;
}

/**
 * Manage the Ayah widget preview: sync container markup, apply sizing, and inject the preview script.
 *
 * @param {UseAyahWidgetPreviewParams} params preferences and translation ids used to configure the embed.
 * @returns {MutableRefObject<HTMLDivElement | null>} ref to attach to the preview container.
 */
const useAyahWidgetPreview = ({
  preferences,
  translationIds,
}: UseAyahWidgetPreviewParams): MutableRefObject<HTMLDivElement | null> => {
  const previewRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [previewOrigin, setPreviewOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPreviewOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !previewRef.current) {
      return undefined;
    }

    const container = previewRef.current;
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    const target = document.createElement('div');
    const widthValue = preferences.customSize.width?.trim() || '100%';
    const heightValue = preferences.customSize.height?.trim();
    target.id = preferences.containerId;
    target.style.width = widthValue;
    if (heightValue) {
      target.style.height = heightValue;
    } else {
      target.style.removeProperty('height');
    }
    target.style.maxWidth = '100%';
    target.style.display = 'block';
    container.appendChild(target);

    const script = document.createElement('script');
    scriptRef.current = script;
    script.src = PREVIEW_SCRIPT_SRC;
    script.async = true;
    if (previewOrigin) {
      script.setAttribute('data-quran-origin', previewOrigin);
    }
    script.setAttribute('data-quran-target', preferences.containerId);
    script.setAttribute('data-quran-allow-rerender', 'true');
    script.setAttribute(
      'data-quran-ayah',
      `${preferences.selectedSurah}:${preferences.selectedAyah}`,
    );
    script.setAttribute('data-quran-translation-ids', translationIds);
    script.setAttribute(
      'data-quran-reciter-id',
      preferences.reciter ? String(preferences.reciter) : '',
    );
    script.setAttribute('data-quran-audio', String(preferences.enableAudio));
    script.setAttribute('data-quran-word-by-word', String(preferences.enableWbwTranslation));
    script.setAttribute('data-quran-theme', preferences.theme);
    script.setAttribute('data-quran-show-translator-names', String(preferences.showTranslatorName));
    script.setAttribute('data-quran-show-quran-link', String(preferences.showQuranLink));
    script.setAttribute('data-quran-show-tafsirs', String(preferences.showTafsirs));
    script.setAttribute('data-quran-show-reflections', String(preferences.showReflections));
    script.setAttribute('data-quran-show-answers', String(preferences.showAnswers));
    script.setAttribute('data-quran-mushaf', preferences.mushaf);
    script.setAttribute('data-quran-show-arabic', String(preferences.showArabic));
    if (preferences.rangeEnabled) {
      script.setAttribute('data-quran-range-end', String(preferences.rangeEnd));
    } else {
      script.removeAttribute('data-quran-range-end');
    }
    script.setAttribute('data-width', widthValue);
    if (heightValue) {
      script.setAttribute('data-height', heightValue);
    } else {
      script.removeAttribute('data-height');
    }

    document.body.appendChild(script);

    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
      scriptRef.current = null;
    };
  }, [
    preferences.containerId,
    preferences.customSize.height,
    preferences.customSize.width,
    preferences.enableAudio,
    preferences.enableWbwTranslation,
    preferences.mushaf,
    preferences.reciter,
    preferences.selectedAyah,
    preferences.selectedSurah,
    preferences.showArabic,
    preferences.showAnswers,
    preferences.showReflections,
    preferences.showTafsirs,
    preferences.rangeEnabled,
    preferences.rangeEnd,
    preferences.showQuranLink,
    preferences.showTranslatorName,
    preferences.theme,
    previewOrigin,
    translationIds,
  ]);

  return previewRef;
};

export default useAyahWidgetPreview;
