import { useEffect, useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './HadithContent.module.scss';

import replaceBreaksWithSpans from '@/components/QuranReader/ReadingView/StudyModeModal/tabs/Hadith/utility';
import Language from '@/types/Language';

const MAX_HEIGHT_THRESHOLD = 150;
const COLLAPSED_HEIGHT = 100;

type HadithContentProps = {
  enBody?: string;
  arBody?: string;
};

const HadithContent: React.FC<HadithContentProps> = ({ enBody, arBody }) => {
  const { lang, t } = useTranslation('common');
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowToggle, setShouldShowToggle] = useState(false);

  // Function to check content height
  const checkContentHeight = () => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(height);
      setShouldShowToggle(height > MAX_HEIGHT_THRESHOLD);
    }
  };

  useEffect(() => {
    // Observe content size changes (font size changes, viewport resize, etc.)
    checkContentHeight();
    const resizeObserver = new ResizeObserver(checkContentHeight);
    if (contentRef.current) resizeObserver.observe(contentRef.current);
    return () => resizeObserver.disconnect();
  }, [enBody, arBody]);

  const handleToggle = () => setIsExpanded((prev) => !prev);
  const isOverflowing = contentHeight > MAX_HEIGHT_THRESHOLD;
  const shouldApplyFade = !isExpanded && isOverflowing;

  return (
    <div className={styles.container}>
      <div
        ref={contentRef}
        className={styles.content}
        style={{
          maxHeight: shouldApplyFade ? `${COLLAPSED_HEIGHT}px` : 'none',
          maskImage: shouldApplyFade
            ? 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)'
            : 'none',
          WebkitMaskImage: shouldApplyFade
            ? 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)'
            : 'none',
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
