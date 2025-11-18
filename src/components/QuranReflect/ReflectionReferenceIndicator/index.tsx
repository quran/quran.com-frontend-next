import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '@/components/Notes/NoteModal/NoteRangesIndicator/NoteRangesIndicator.module.scss';
import DataContext from '@/contexts/DataContext';
import Reference from '@/types/QuranReflect/Reference';
import { getChapterData } from '@/utils/chapter';
import { toLocalizedVerseKey } from '@/utils/locale';
import { isSurahReference } from '@/utils/quranReflect/string';

type Props = {
  reference: Reference;
};

const ReflectionReferenceIndicator: React.FC<Props> = ({ reference }) => {
  const { lang, t } = useTranslation('common');
  const chaptersData = useContext(DataContext);
  if (!reference) {
    return null;
  }

  const { id, chapterId, from, to } = reference;
  const isSurah = isSurahReference(id);
  const chapterString = chapterId.toString();
  const chapterData = getChapterData(chaptersData, chapterString);
  let referenceKey = `${t('surah')} ${chapterData.transliteratedName}`;
  // if it's not a full surah
  if (!isSurah) {
    const localizedStartVerseKey = `${referenceKey} ${toLocalizedVerseKey(
      chapterString,
      lang,
    )}:${toLocalizedVerseKey(from.toString(), lang)}`;
    if (from === to) {
      // e.g. 11:1
      referenceKey = localizedStartVerseKey;
    } else {
      // e.g. 11:1-6
      referenceKey = `${localizedStartVerseKey}-${toLocalizedVerseKey(to.toString(), lang)}`;
    }
  }
  return <div className={styles.container}>{referenceKey}</div>;
};

export default ReflectionReferenceIndicator;
