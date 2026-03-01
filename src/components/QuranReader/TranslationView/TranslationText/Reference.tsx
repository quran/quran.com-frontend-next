import { useCallback, useMemo } from 'react';

import styles from './TranslationText.module.scss';

import Link from '@/dls/Link/Link';
import EventNames from '@/utils/event-names';
import { logButtonClick } from '@/utils/eventLogger';
import { isRTLLocale, toLocalizedVerseKey, toLocalizedVerseKeyRTL } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';

interface Props {
  reference: string;
  chapterName: string;
  lang: string;
}

const Reference = ({ reference, chapterName, lang }: Props) => {
  const localizedReference = useMemo(() => {
    if (!reference) return '';

    return isRTLLocale(lang)
      ? toLocalizedVerseKeyRTL(reference, lang)
      : toLocalizedVerseKey(reference, lang);
  }, [reference, lang]);

  const handleClick = useCallback(() => {
    logButtonClick(EventNames.QURAN_READER_TRANSLATION_REFERENCE, { reference, chapterName, lang });
  }, [reference, chapterName, lang]);

  return (
    <Link
      onClick={handleClick}
      href={getChapterWithStartingVerseUrl(reference)}
      className={styles.referenceLink}
      aria-label={`${chapterName} ${localizedReference}`}
    >
      {`${chapterName} ${localizedReference}`}
    </Link>
  );
};

export default Reference;
