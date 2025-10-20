import React, { MouseEvent } from 'react';

import classNames from 'classnames';
import Link from 'next/link';

import styles from './TranslationText.module.scss';

import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedVerseKey } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';

interface Props {
  text: string;
  fontClass: string;
  direction: string;
  onTextClicked: (event: MouseEvent) => void;
  shouldShowReference?: boolean;
  chapterName?: string;
  reference?: string;
  lang: string;
}

const TranslationAndReference: React.FC<Props> = ({
  text,
  fontClass,
  direction,
  onTextClicked,
  shouldShowReference = false,
  chapterName,
  reference,
  lang,
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(event) => onTextClicked(event)}
      onKeyDown={(event) => {
        // Enable basic keyboard accessibility for activation without changing click behavior
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
        }
      }}
      className={classNames(styles.text, fontClass, !shouldShowReference && styles[direction])}
    >
      <div
        className={classNames(!shouldShowReference && styles.innerText)}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: shouldShowReference ? `"${text}"` : text }}
      />
      {shouldShowReference && chapterName && reference && (
        <>
          {' '}
          <Link
            onClick={() => {
              logButtonClick('translation_reference_open');
            }}
            href={getChapterWithStartingVerseUrl(reference)}
            className={styles.referenceLink}
          >
            {`${chapterName} ${toLocalizedVerseKey(reference, lang)}`}
          </Link>
        </>
      )}
    </div>
  );
};

export default TranslationAndReference;
