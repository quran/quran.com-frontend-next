import { useCallback, useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './InlineShowMore.module.scss';

interface InlineShowMoreProps {
  children: string;
  lines?: number;
  className?: string;
  contentClassName?: string;
  showReadMore?: boolean;

  seeLessText?: string;
  readMoreText?: string;
}

/**
 * InlineShowMore - Shows text truncated to N lines with inline "Show more" button
 * @returns {React.ReactElement} The truncated text component with inline toggle
 */
const InlineShowMore: React.FC<InlineShowMoreProps> = ({
  children,
  lines = 2,
  className,
  contentClassName,
  showReadMore = true,
  seeLessText,
  readMoreText,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('common');

  const content = children ?? '';

  // Check if content exceeds the specified number of lines
  useEffect(() => {
    const element = contentRef.current;
    if (!element) return undefined;

    const checkTruncation = () => {
      const isOverflowing = element.scrollHeight > element.clientHeight;
      setNeedsTruncation(isOverflowing);
    };

    checkTruncation();

    // Re-check when element size changes
    const resizeObserver = new ResizeObserver(checkTruncation);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [content, lines]);

  const toggleExpanded = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setExpanded((prev) => !prev);
  }, []);

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.textWrapper}>
        <div
          ref={contentRef}
          className={classNames(styles.content, contentClassName, {
            [styles.truncated]: !expanded,
          })}
          style={{ WebkitLineClamp: expanded ? 'unset' : lines }}
        >
          {content}{' '}
          {expanded && showReadMore && (
            <button type="button" className={styles.lessBtn} onClick={toggleExpanded}>
              {seeLessText ?? t('see-less')}
            </button>
          )}
        </div>
        {!expanded && needsTruncation && showReadMore && (
          <div className={styles.fadeOverlay}>
            <button type="button" className={styles.moreBtn} onClick={toggleExpanded}>
              ... {readMoreText ?? t('read-more')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InlineShowMore;
