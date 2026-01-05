/* eslint-disable react-func/max-lines-per-function */
import { useEffect } from 'react';

import type { WidgetOptions } from '@/types/ayah-widget';

const WIDGET_ROOT_SELECTOR = '.quran-widget';

/**
 * Build quran.com URL for this widget configuration.
 * @param {WidgetOptions} options - The widget options.
 * @returns {string} The quran.com URL for this widget configuration.
 */
const buildVerseUrl = (options: WidgetOptions): string => {
  const [chapterId, verseId] = options.ayah.split(':');
  const verseLabel = options.rangeEnd ? `${verseId}-${options.rangeEnd}` : verseId;
  const localePrefix = options.locale === 'en' ? '' : `/${options.locale}`;
  return `https://quran.com${localePrefix}/${chapterId}:${verseLabel}`;
};

/**
 * Build the text that should be copied when clicking "Copy".
 * @param {HTMLElement} root - The root element of the widget.
 * @param {WidgetOptions} options - The widget options.
 * @returns {string} The text that should be copied when clicking "Copy".
 */
const buildCopyText = (root: HTMLElement, options: WidgetOptions): string => {
  const [chapterId, verseId] = options.ayah.split(':');
  const verseLabel = options.rangeEnd ? `${verseId}-${options.rangeEnd}` : verseId;
  const rangeCaption = `${chapterId}:${verseLabel}`;
  const header = options.surahName ? `${options.surahName} (${rangeCaption})` : rangeCaption;

  const verseBlocks = Array.from(root.querySelectorAll('[data-verse-block]')) as HTMLElement[];
  const blocks: string[] = [];

  verseBlocks.forEach((block) => {
    const lines: string[] = [];

    const arabicNode = block.querySelector('[data-verse-text]') as HTMLElement | null;
    const arabicText = arabicNode?.dataset?.arabicVerse?.trim();
    if (options.showArabic && arabicText) lines.push(arabicText);

    const translationNodes = Array.from(block.querySelectorAll('[data-translation-text]'));
    translationNodes.forEach((node) => {
      const text = (node.textContent || '').trim();
      if (!text) return;
      lines.push(text);
      if (options.showTranslatorNames) {
        const name = node.getAttribute('data-translator-name');
        if (name) lines.push(`- ${name}`);
      }
    });

    if (lines.length) blocks.push(lines.join('\n'));
  });

  // Fallback: if no verse blocks, copy translation-only nodes
  if (!blocks.length) {
    const translationNodes = Array.from(root.querySelectorAll('[data-translation-text]'));
    translationNodes.forEach((node) => {
      const text = (node.textContent || '').trim();
      if (!text) return;
      const lines = [text];
      if (options.showTranslatorNames) {
        const name = node.getAttribute('data-translator-name');
        if (name) lines.push(`- ${name}`);
      }
      blocks.push(lines.join('\n'));
    });
  }

  return [header, ...blocks, buildVerseUrl(options)].filter(Boolean).join('\n\n');
};

/**
 * Wire widget interactions (copy, share, audio) on the client.
 * @param {WidgetOptions} options - The widget options.
 */
const useWidgetInteractions = (options?: WidgetOptions): void => {
  useEffect(() => {
    if (!options) return undefined;

    const widgetRoot = document.querySelector(WIDGET_ROOT_SELECTOR) as HTMLElement | null;
    if (!widgetRoot) return undefined;

    const copyButton = widgetRoot.querySelector('[data-copy-verse]') as HTMLButtonElement | null;
    const shareButton = widgetRoot.querySelector('[data-share-verse]') as HTMLButtonElement | null;
    const audioButton = widgetRoot.querySelector('[data-audio-button]') as HTMLButtonElement | null;
    const audioElement = widgetRoot.querySelector(
      '[data-audio-element]',
    ) as HTMLAudioElement | null;

    const writeClipboard = async (text: string) => {
      if (!navigator.clipboard?.writeText) return;
      await navigator.clipboard.writeText(text);
    };

    const handleCopy = async () => {
      try {
        await writeClipboard(buildCopyText(widgetRoot, options));
      } catch {
        // ignore
      }
    };

    const handleShare = async () => {
      try {
        await writeClipboard(buildVerseUrl(options));
      } catch {
        // ignore
      }
    };

    copyButton?.addEventListener('click', handleCopy);
    shareButton?.addEventListener('click', handleShare);

    let cleanupAudio: (() => void) | null = null;

    if (audioButton && audioElement) {
      const playIcon = audioButton.querySelector('[data-play-icon]') as HTMLElement | null;
      const pauseIcon = audioButton.querySelector('[data-pause-icon]') as HTMLElement | null;

      const audioStart = Number(audioElement.dataset.audioStart || 0);
      const audioEnd = Number(audioElement.dataset.audioEnd || 0);

      const setPlayingUi = (isPlaying: boolean) => {
        if (playIcon) playIcon.style.display = isPlaying ? 'none' : 'inline-flex';
        if (pauseIcon) pauseIcon.style.display = isPlaying ? 'inline-flex' : 'none';
      };

      const resetToStart = () => {
        audioElement.currentTime = audioStart || 0;
      };

      const handleToggle = async () => {
        if (audioElement.paused) {
          if (audioStart) resetToStart();
          try {
            await audioElement.play();
          } catch {
            // ignore autoplay restrictions
          }
        } else {
          audioElement.pause();
        }
      };

      const handleTimeUpdate = () => {
        if (!audioEnd) return;
        if (audioElement.currentTime >= audioEnd) {
          audioElement.pause();
          resetToStart();
        }
      };

      const handlePlay = () => setPlayingUi(true);
      const handlePause = () => setPlayingUi(false);

      audioButton.addEventListener('click', handleToggle);
      audioElement.addEventListener('timeupdate', handleTimeUpdate);
      audioElement.addEventListener('play', handlePlay);
      audioElement.addEventListener('pause', handlePause);
      audioElement.addEventListener('ended', handlePause);

      setPlayingUi(!audioElement.paused);

      cleanupAudio = () => {
        audioButton.removeEventListener('click', handleToggle);
        audioElement.removeEventListener('timeupdate', handleTimeUpdate);
        audioElement.removeEventListener('play', handlePlay);
        audioElement.removeEventListener('pause', handlePause);
        audioElement.removeEventListener('ended', handlePause);
      };
    }

    return () => {
      copyButton?.removeEventListener('click', handleCopy);
      shareButton?.removeEventListener('click', handleShare);
      cleanupAudio?.();
    };
  }, [options]);
};

export default useWidgetInteractions;
