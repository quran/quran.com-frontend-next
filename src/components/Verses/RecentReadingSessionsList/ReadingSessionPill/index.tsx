import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingSessionPill.module.scss';

import DataContext from '@/contexts/DataContext';
import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
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

  const readingSessionText = `${chapterData.transliteratedName} ${toLocalizedVerseKey(
    verseKey,
    lang,
  )}`;
  return (
    <div className={styles.readingSessionItem}>
      <Button
        onClick={onLinkClicked}
        href={getChapterWithStartingVerseUrl(verseKey)}
        type={ButtonType.Primary}
        variant={ButtonVariant.Compact}
        className={styles.linkButtonContainer}
        size={ButtonSize.Small}
      >
        {readingSessionText}
      </Button>
    </div>
  );
};

export default ReadingSessionPill;
