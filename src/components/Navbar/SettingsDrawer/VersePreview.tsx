/* eslint-disable max-lines */
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useSWR from 'swr';

import PreviewTooltip from './PreviewTooltip';
import styles from './VersePreview.module.scss';
import VersePreviewSkeleton from './VersePreviewSkeleton';

import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import VerseText from '@/components/Verse/VerseText';
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
const CONTENT_DELAY = 400;

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
  const [tooltipLeft, setTooltipLeft] = useState(0);
  const [isTooltipReady, setIsTooltipReady] = useState(false);

  useBrowserLayoutEffect(() => {
    let isMounted = true;
    const calculatePosition = () => {
      if (!isMounted || !containerRef.current || !sampleVerse?.words || !showContent) return;
      const selector = `[data-word-location$=":${HIGHLIGHTED_WORD_POSITION}"]`;
      const wordElement = containerRef.current.querySelector(selector) as HTMLElement;
      if (!wordElement) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const wordRect = wordElement.getBoundingClientRect();
      const wordCenterX = wordRect.left + wordRect.width / 2;
      setTooltipLeft(wordCenterX - containerRect.left);
      setIsTooltipReady(true);
    };
    const timeoutId = setTimeout(calculatePosition, 50);
    const resizeObserver = new ResizeObserver(calculatePosition);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [
    quranReaderStyles.quranFont,
    quranReaderStyles.quranTextFontScale,
    showContent,
    sampleVerse?.words,
  ]);

  const handleInteraction = useCallback(() => {
    if (!hasLoggedInteraction.current) {
      logEvent('verse_preview_interaction');
      hasLoggedInteraction.current = true;
    }
  }, []);

  const hasBothTooltipTypes =
    showTooltipFor.includes(WordByWordType.Translation) &&
    showTooltipFor.includes(WordByWordType.Transliteration);
  const highlightedWord = useMemo(
    () =>
      (sampleVerse?.words as Word[])?.find((w) => w.position === HIGHLIGHTED_WORD_POSITION) ?? null,
    [sampleVerse?.words],
  );

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), CONTENT_DELAY);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isQCFFont(quranReaderStyles.quranFont) || !sampleVerse) return;
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
    fontFace.load().then(() => dispatch(addLoadedFontFace(fontFaceName)));
  }, [dispatch, quranReaderStyles.quranFont, sampleVerse, settingsTheme, themeVariant]);

  if (!sampleVerse) return <VersePreviewSkeleton />;

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
                leftPosition={tooltipLeft}
                isVisible={isTooltipReady}
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
          <VersePreviewSkeleton />
        )}
      </div>
    </>
  );
};

export default VersePreview;
