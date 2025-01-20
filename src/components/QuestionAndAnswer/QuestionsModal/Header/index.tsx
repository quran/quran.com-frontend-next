import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Header.module.scss';

import DataContext from '@/contexts/DataContext';
import HelperTooltip from '@/dls/HelperTooltip/HelperTooltip';
import { ContentSide } from '@/dls/Popover';
import ScholarsSayIcon from '@/icons/lighbulb.svg';
import { getChapterData } from '@/utils/chapter';
import { toLocalizedVerseKey } from '@/utils/locale';
import { getChapterNumberFromKey } from '@/utils/verse';

interface Props {
  verseKey: string;
}

const QuestionsModalHeader: React.FC<Props> = ({ verseKey }) => {
  const { t, lang } = useTranslation();
  const chapterNumber = getChapterNumberFromKey(verseKey);
  const chaptersData = useContext(DataContext);
  const chapter = getChapterData(chaptersData, String(chapterNumber));
  return (
    <div>
      <div className={styles.headerContainer}>
        <ScholarsSayIcon />
        <div>
          <div>{t('quran-reader:q-and-a.explore_answers')}</div>
          <p className={styles.verseKey}>{`${chapter.transliteratedName} ${toLocalizedVerseKey(
            verseKey,
            lang,
          )}`}</p>
        </div>
        <HelperTooltip contentSide={ContentSide.BOTTOM} iconClassName={styles.icon}>
          {t('quran-reader:q-and-a.explore_answers_tooltip')}
        </HelperTooltip>
      </div>
    </div>
  );
};

export default QuestionsModalHeader;
