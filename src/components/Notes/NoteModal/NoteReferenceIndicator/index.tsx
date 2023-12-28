import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './NoteRangesIndicator.module.scss';

import DataContext from '@/contexts/DataContext';
import { NoteReference } from '@/types/auth/Note';
import { getChapterData } from '@/utils/chapter';
import { toLocalizedVerseKey } from '@/utils/locale';

type Props = {
  reference: NoteReference;
};

const NoteReferenceIndicator: React.FC<Props> = ({ reference }) => {
  const { lang, t } = useTranslation('common');
  const chaptersData = useContext(DataContext);
  if (!reference) {
    return <></>;
  }

  const { surahId, fromAyah, toAyah, isSurah } = reference;
  const chapterData = getChapterData(chaptersData, surahId.toString());
  let referenceKey = `${t('surah')} ${chapterData.transliteratedName}`;
  // if it's not a full surah
  if (!isSurah) {
    const localizedStartVerseKey = `${referenceKey} ${toLocalizedVerseKey(
      surahId.toString(),
      lang,
    )}:${toLocalizedVerseKey(fromAyah.toString(), lang)}`;
    if (fromAyah === toAyah) {
      // e.g. 11:1
      referenceKey = localizedStartVerseKey;
    } else {
      // e.g. 11:1-6
      referenceKey = `${localizedStartVerseKey}-${toLocalizedVerseKey(toAyah.toString(), lang)}`;
    }
  }
  return <div className={styles.container}>{referenceKey}</div>;
};

export default NoteReferenceIndicator;
