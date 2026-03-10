import { useCallback, useMemo } from 'react';

import classNames from 'classnames';

import styles from './TranslationText.module.scss';

import Link from '@/dls/Link/Link';
import EventName from '@/utils/event-names';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedVerseKeyAuto } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';

interface Props {
  reference: string;
  chapterName: string;
  lang: string;
  isLink?: boolean;
  className?: string;
}

const Reference = ({ reference, chapterName, lang, isLink = true, className }: Props) => {
  const localizedReference = useMemo(() => {
    if (!reference) return '';

    return toLocalizedVerseKeyAuto(reference, lang);
  }, [reference, lang]);
  const resolvedChapterName = chapterName;

  const handleClick = useCallback(() => {
    logButtonClick(EventName.QURAN_READER_TRANSLATION_REFERENCE, {
      reference,
      chapterName: resolvedChapterName,
      lang,
    });
  }, [reference, resolvedChapterName, lang]);

  const referenceText = `${resolvedChapterName} ${localizedReference}`;
  const resolvedClassName = classNames(styles.referenceLink, className);

  if (!isLink) {
    return (
      <span className={resolvedClassName} aria-label={referenceText}>
        {referenceText}
      </span>
    );
  }

  return (
    <Link
      onClick={handleClick}
      href={getChapterWithStartingVerseUrl(reference)}
      className={resolvedClassName}
      aria-label={referenceText}
    >
      {referenceText}
    </Link>
  );
};

export default Reference;
