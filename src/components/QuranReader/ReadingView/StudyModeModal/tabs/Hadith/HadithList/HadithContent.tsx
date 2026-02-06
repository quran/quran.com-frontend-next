import { useCallback, useEffect, useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './HadithContent.module.scss';

import replaceBreaksWithSpans from '@/components/QuranReader/ReadingView/StudyModeModal/tabs/Hadith/utility';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import Language from '@/types/Language';

const COLLAPSED_LINE_COUNT = 3;
const OVERFLOW_LINE_COUNT = 4;

type HadithContentProps = {
  enBody?: string;
  arBody?: string;
};

const HadithContent: React.FC<HadithContentProps> = ({ enBody, arBody }) => {
  const { lang, t } = useTranslation('common');
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [lineHeight, setLineHeight] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowToggle, setShouldShowToggle] = useState(false);

  // Calculate the actual rendered line height from computed styles
  const calculateLineHeight = useCallback((): number => {
    if (!contentRef.current) return 0;
    const computedStyle = window.getComputedStyle(contentRef.current);
    return parseFloat(computedStyle.lineHeight.replace('px', ''));
  }, []);

  // Function to check content height and calculate line-based thresholds
  const checkContentHeight = useCallback(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(height);

      const currentLineHeight = calculateLineHeight();
      setLineHeight(currentLineHeight);

      // Show toggle if content exceeds OVERFLOW_LINE_COUNT lines
      setShouldShowToggle(height > currentLineHeight * OVERFLOW_LINE_COUNT);
    }
  }, [calculateLineHeight]);

  useEffect(() => {
    // Observe content size changes (font size changes, viewport resize, etc.)
    checkContentHeight();
    const resizeObserver = new ResizeObserver(checkContentHeight);
    if (contentRef.current) resizeObserver.observe(contentRef.current);
    return () => resizeObserver.disconnect();
  }, [enBody, arBody, checkContentHeight, quranReaderStyles.hadithFontScale]);

  const handleToggle = () => setIsExpanded((prev) => !prev);
  const isOverflowing = contentHeight > lineHeight * OVERFLOW_LINE_COUNT;
  const shouldApplyFade = !isExpanded && isOverflowing;

  return (
    <div className={styles.container}>
      <div
        ref={contentRef}
        className={styles.content}
        data-faded={shouldApplyFade}
        data-collapsed={shouldApplyFade}
        style={{
          maxHeight: shouldApplyFade ? `${lineHeight * COLLAPSED_LINE_COUNT}px` : undefined,
        }}
      >
        {Language.AR !== lang && enBody && (
          <div
            className={styles.hadithBody}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: replaceBreaksWithSpans(enBody.toString()),
            }}
          />
        )}

        {arBody && (
          <div
            data-lang="ar"
            dir="rtl"
            className={styles.hadithBody}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: replaceBreaksWithSpans(arBody.toString()),
            }}
          />
        )}
      </div>

      {shouldShowToggle && (
        <button
          type="button"
          onClick={handleToggle}
          className={styles.toggleButton}
          aria-expanded={isExpanded}
        >
          {isExpanded ? t('common:see-less') : t('common:see-more')}
        </button>
      )}
    </div>
  );
};

export default HadithContent;
