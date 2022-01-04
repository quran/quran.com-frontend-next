import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './TafsirView.module.scss';

import Select, { SelectSize } from 'src/components/dls/Forms/Select';
import { getAllChaptersData } from 'src/utils/chapter';
import { toLocalizedNumber } from 'src/utils/locale';
import { generateChapterVersesKeys, getVerseNumberFromKey } from 'src/utils/verse';

const SurahAndAyahSelection = ({
  selectedChapterId,
  selectedVerseNumber,
  onChapterIdChange,
  onVerseNumberChange,
}) => {
  const { lang } = useTranslation();
  const chapterData = getAllChaptersData(lang);
  const verses = generateChapterVersesKeys(selectedChapterId);
  const surahOptions = useMemo(
    () =>
      Object.entries(chapterData).map(([id, chapter]) => ({
        label: chapter.transliteratedName,
        value: id,
      })),
    [chapterData],
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
