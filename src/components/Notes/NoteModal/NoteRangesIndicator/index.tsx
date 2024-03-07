import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './NoteRangesIndicator.module.scss';

import DataContext from '@/contexts/DataContext';
import { getChapterData } from '@/utils/chapter';
import { toLocalizedVerseKey } from '@/utils/locale';
import { parseVerseRange } from '@/utils/verseKeys';

type Props = {
  ranges: string[];
};

const NoteRangesIndicator: React.FC<Props> = ({ ranges }) => {
  const { lang } = useTranslation();
  const chaptersData = useContext(DataContext);
  if (!ranges || ranges.length === 0) {
    return <></>;
  }

  // TODO: ranges[0] is temporary and assumes that a note has only one range and 1 Ayah inside that range
  const [{ chapter, verseKey }] = parseVerseRange(ranges[0]);
  const chapterData = getChapterData(chaptersData, chapter);
  const verseKeyName = `${chapterData.transliteratedName} ${toLocalizedVerseKey(verseKey, lang)}`;
  return <div className={styles.container}>{verseKeyName}</div>;
};

export default NoteRangesIndicator;
