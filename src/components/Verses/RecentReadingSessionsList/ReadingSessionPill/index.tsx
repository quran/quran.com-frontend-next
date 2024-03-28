import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingSessionPill.module.scss';

import DataContext from '@/contexts/DataContext';
import Link from '@/dls/Link/Link';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedVerseKey } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';
import { getChapterNumberFromKey } from '@/utils/verse';

interface Props {
  verseKey: string;
}

const ReadingSessionPill: React.FC<Props> = ({ verseKey }) => {
  const { lang } = useTranslation();
  const chaptersData = useContext(DataContext);

  const chapterNumber = getChapterNumberFromKey(verseKey);
  const chapterData = getChapterData(chaptersData, chapterNumber.toString());

  const onLinkClicked = () => {
    logButtonClick('recent_sessions_list_item_link');
  };

  const bookmarkText = `${chapterData.transliteratedName} ${toLocalizedVerseKey(verseKey, lang)}`;
  return (
    <div className={styles.bookmarkItem}>
      <Link
        href={getChapterWithStartingVerseUrl(verseKey)}
        onClick={onLinkClicked}
        className={styles.linkButtonContainer}
      >
        {bookmarkText}
      </Link>
    </div>
  );
};

export default ReadingSessionPill;
