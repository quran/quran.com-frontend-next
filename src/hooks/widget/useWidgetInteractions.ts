/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { useEffect } from 'react';

import type { WidgetOptions } from '@/types/ayah-widget';
import { toLocalizedNumber } from '@/utils/locale';

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
 * Convert number to Arabic numeral using the locale utility.
 * @param {number} num - The number to convert.
 * @returns {string} Arabic numeral string.
 */
const toArabicNumeral = (num: number): string => toLocalizedNumber(num, 'ar');

/**
 * Build the text that should be copied when clicking "Copy".
 * Uses pre-built copy data from the widget's data attribute for proper Arabic text.
 * Formats differently based on mergeVerses mode.
 * @param {HTMLElement} root - The root element of the widget.
 * @param {WidgetOptions} options - The widget options.
 * @returns {string} The text that should be copied when clicking "Copy".
 */
const buildCopyText = (root: HTMLElement, options: WidgetOptions): string => {
  const [chapterId, verseId] = options.ayah.split(':');
  const verseLabel = options.rangeEnd ? `${verseId}-${options.rangeEnd}` : verseId;
  const rangeCaption = `${chapterId}:${verseLabel}`;
  const header = options.surahName ? `${options.surahName} (${rangeCaption})` : rangeCaption;

  const parts: string[] = [header];

  // Try to get copy data from the data attribute (contains proper Arabic text)
  const copyDataAttr = root.getAttribute('data-copy-data');
  if (copyDataAttr) {
    try {
      const copyData = JSON.parse(copyDataAttr) as {
        mergeVerses: boolean;
        verses: {
          verseNumber: number;
          arabicText: string;
          translations: { text: string; translatorName?: string }[];
        }[];
      };

      if (copyData.mergeVerses) {
        // MERGED MODE: All Arabic together with verse numbers, then all translations together
        // Arabic: بِسْمِ ٱللَّهِ ١ ٱلْحَمْدُ لِلَّهِ ٢
        const arabicParts = copyData.verses
          .filter((v) => v.arabicText)
          .map((v) => `${v.arabicText}  ${toArabicNumeral(v.verseNumber)}`);
        if (arabicParts.length) {
          parts.push(arabicParts.join('  '));
          parts.push(''); // Empty line between Arabic and translations
        }

        // Translations grouped by translator, with verse numbers inline: text (1) text (2)
        // Group translations by translator name
        const translatorGroups = new Map<string, string[]>();
        copyData.verses.forEach((verse) => {
          verse.translations.forEach((t) => {
            const key = t.translatorName || '';
            if (!translatorGroups.has(key)) {
              translatorGroups.set(key, []);
            }
            translatorGroups.get(key)!.push(`${t.text} (${verse.verseNumber})`);
          });
        });

        translatorGroups.forEach((texts, translatorName) => {
          parts.push(texts.join(' '));
          if (translatorName) {
            parts.push(`— ${translatorName}`);
          }
        });
      } else {
        // NON-MERGED MODE: Each verse as a separate block
        // ١ Arabic text
        // 1. Translation
        // - translator
        copyData.verses.forEach((verse) => {
          const verseLines: string[] = [];

          // Arabic with verse number at end
          if (verse.arabicText) {
            verseLines.push(`${verse.arabicText} ${toArabicNumeral(verse.verseNumber)}`);
            verseLines.push(''); // Empty line between Arabic and translation
          }

          // Translations with verse number prefix
          verse.translations.forEach((t) => {
            verseLines.push(`${verse.verseNumber}. ${t.text}`);
            if (t.translatorName) {
              verseLines.push(`— ${t.translatorName}`);
            }
          });

          if (verseLines.length) {
            parts.push(verseLines.join('\n'));
          }
        });
      }
    } catch {
      // Fallback: if JSON parsing fails, return just header and URL
    }
  }

  // Add the URL at the end
  parts.push(buildVerseUrl(options));

  return parts.filter(Boolean).join('\n\n');
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
