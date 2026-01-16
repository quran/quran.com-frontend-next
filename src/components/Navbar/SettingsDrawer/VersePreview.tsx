import { useEffect, useState, useCallback, useRef, useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useSWR from 'swr';

import PreviewTooltip from './PreviewTooltip';
import styles from './VersePreview.module.scss';

import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import VerseText from '@/components/Verse/VerseText';
import Skeleton from '@/dls/Skeleton/Skeleton';
import useBrowserLayoutEffect from '@/hooks/useBrowserLayoutEffect';
import useThemeDetector from '@/hooks/useThemeDetector';
import { addLoadedFontFace } from '@/redux/slices/QuranReader/font-faces';
import { selectTooltipContentType } from '@/redux/slices/QuranReader/readingPreferences';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectTheme } from '@/redux/slices/theme';
import ThemeType from '@/redux/types/ThemeType';
import { QuranFont, WordByWordType } from '@/types/QuranReader';
import { areArraysEqual } from '@/utils/array';
import { logEvent } from '@/utils/eventLogger';
import { getFontFaceNameForPage, getQCFFontFaceSource, isQCFFont } from '@/utils/fontFaceHelper';
import getSampleVerse from '@/utils/sampleVerse';
import Word from 'types/Word';

const SWR_SAMPLE_VERSE_KEY = 'sample-verse';
const HIGHLIGHTED_WORD_POSITION = 3;
const CONTENT_DELAY = 400; // ms

const VersePreview = () => {
  const { t } = useTranslation('quran-reader');
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const settingsTheme: { type: ThemeType } = useSelector(selectTheme, shallowEqual);
  const { themeVariant } = useThemeDetector();
  const { data: sampleVerse } = useSWR(SWR_SAMPLE_VERSE_KEY, () => getSampleVerse());
  const dispatch = useDispatch();
  const [showContent, setShowContent] = useState(false);
  const showTooltipFor = useSelector(selectTooltipContentType, areArraysEqual) as WordByWordType[];
  const hasLoggedInteraction = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    left: number;
    isReady: boolean;
  }>({ left: 0, isReady: false });

  // Log verse preview interaction only once per drawer session
  const handleInteraction = useCallback(() => {
    if (!hasLoggedInteraction.current) {
      logEvent('verse_preview_interaction');
      hasLoggedInteraction.current = true;
    }
  }, []);

  // Check if both translation and transliteration are enabled
  const hasBothTooltipTypes =
    showTooltipFor.includes(WordByWordType.Translation) &&
    showTooltipFor.includes(WordByWordType.Transliteration);

  // Get the highlighted word for the static tooltip
  const highlightedWord = useMemo(() => {
    if (!sampleVerse?.words) return null;
    return (sampleVerse.words as Word[]).find(
      (word) => word.position === HIGHLIGHTED_WORD_POSITION,
    );
  }, [sampleVerse?.words]);

  // Calculate tooltip position based on highlighted word's actual position
  useBrowserLayoutEffect(() => {
    const calculatePosition = () => {
      if (!containerRef.current || !sampleVerse?.words || !showContent) return;

      // Find the highlighted word element using data-word-location attribute
      const highlightedWordElement = containerRef.current.querySelector(
        `[data-word-location$=":${HIGHLIGHTED_WORD_POSITION}"]`,
      ) as HTMLElement;

      if (!highlightedWordElement) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const targetRect = highlightedWordElement.getBoundingClientRect();

      // Calculate the center of the target word relative to container's left edge
      const targetCenterX = targetRect.left + targetRect.width / 2;
      const left = targetCenterX - containerRect.left;

      setTooltipPosition({ left, isReady: true });
    };

    // Initial calculation with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(calculatePosition, 50);

    // Recalculate on container size changes (font loading, resize, etc.)
    const resizeObserver = new ResizeObserver(() => {
      calculatePosition();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [
    quranReaderStyles.quranFont,
    quranReaderStyles.quranTextFontScale,
    showContent,
    sampleVerse,
  ]);

  // Delay showing content by 400ms to prevent layout shift
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), CONTENT_DELAY);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isQCFFont(quranReaderStyles.quranFont) && sampleVerse) {
      const fontFaceName = getFontFaceNameForPage(
        quranReaderStyles.quranFont as QuranFont,
        sampleVerse.pageNumber,
      );
      const fontFace = new FontFace(
        fontFaceName,
        getQCFFontFaceSource(
          quranReaderStyles.quranFont as QuranFont,
          sampleVerse.pageNumber,
          themeVariant,
        ),
      );
      document.fonts.add(fontFace);
      fontFace.load().then(() => {
        dispatch(addLoadedFontFace(fontFaceName));
      });
    }
  }, [dispatch, quranReaderStyles.quranFont, sampleVerse, settingsTheme, themeVariant]);

  if (!sampleVerse) {
    return (
      <>
        <div className={styles.skeletonContainer}>
          <Skeleton>
            <div className={styles.skeletonPlaceholder} />
          </Skeleton>
        </div>
        <div className={styles.skeletonContainer}>
          <Skeleton>
            <div className={styles.skeletonPlaceholder} />
          </Skeleton>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className={classNames(styles.previewTitle, {
          [styles.previewTitleExpanded]: hasBothTooltipTypes,
        })}
      >
        {t('verse-preview-title')}
      </div>
      <div
        ref={containerRef}
        dir="rtl"
        className={styles.container}
        onClick={handleInteraction}
        onKeyDown={handleInteraction}
        role="presentation"
      >
        {showContent ? (
          <>
            {highlightedWord && (
              <PreviewTooltip
                word={highlightedWord}
                left={tooltipPosition.left}
                isVisible={tooltipPosition.isReady}
              />
            )}
            <VerseText
              words={sampleVerse.words as Word[]}
              highlightedWordPosition={HIGHLIGHTED_WORD_POSITION}
              isWordInteractionDisabled
              shouldDisableForceTooltip
            />
            {sampleVerse.translations?.[0]?.text && sampleVerse.translations?.[0]?.languageId && (
              <TranslationText
                translationFontScale={quranReaderStyles.translationFontScale}
                text={sampleVerse.translations[0].text}
                languageId={sampleVerse.translations[0].languageId}
                className={styles.translationText}
              />
            )}
          </>
        ) : (
          <>
            <div className={styles.skeletonContainer}>
              <Skeleton>
                <div className={styles.skeletonPlaceholder} />
              </Skeleton>
            </div>
            <div className={styles.skeletonContainer}>
              <Skeleton>
                <div className={styles.skeletonPlaceholder} />
              </Skeleton>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default VersePreview;
