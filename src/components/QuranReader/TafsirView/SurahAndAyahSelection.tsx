import { useContext, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './TafsirView.module.scss';

import Select, { SelectSize } from '@/dls/Forms/Select';
import { toLocalizedNumber } from '@/utils/locale';
import { generateChapterVersesKeys, getVerseNumberFromKey } from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';

const SurahAndAyahSelection = ({
  selectedChapterId,
  selectedVerseNumber,
  onChapterIdChange,
  onVerseNumberChange,
}) => {
  const { lang } = useTranslation();
  const chaptersData = useContext(DataContext);
  const verses = generateChapterVersesKeys(chaptersData, selectedChapterId);
  const surahOptions = useMemo(
    () =>
      Object.entries(chaptersData).map(([id, chapter]) => ({
        label: chapter.transliteratedName,
        value: id,
      })),
    [chaptersData],
  );
  const ayahOptions = useMemo(
    () =>
      verses.map((verseKey) => {
        const verseNumber = getVerseNumberFromKey(verseKey).toString();
        return {
          label: toLocalizedNumber(Number(verseNumber), lang),
          value: verseNumber,
        };
      }),
    [lang, verses],
  );

  return (
    <div className={styles.surahAndAyahSelectionContainer}>
      <Select
        size={SelectSize.Small}
        id="surah-selection"
        name="surah-selection"
        options={surahOptions}
        onChange={onChapterIdChange}
        value={selectedChapterId}
      />
      <div className={styles.selectionItem}>
        <Select
          className={styles.ayahSelection}
          size={SelectSize.Small}
          id="ayah-selection"
          name="ayah-selection"
          options={ayahOptions}
          onChange={onVerseNumberChange}
          value={selectedVerseNumber}
        />
      </div>
    </div>
  );
};

export default SurahAndAyahSelection;
