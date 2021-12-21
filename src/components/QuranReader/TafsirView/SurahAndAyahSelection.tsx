import styles from './TafsirView.module.scss';

import Select, { SelectSize } from 'src/components/dls/Forms/Select';
import { getAllChaptersData } from 'src/utils/chapter';
import { generateChapterVersesKeys, getVerseNumberFromKey } from 'src/utils/verse';

const SurahAndAyahSelection = ({
  selectedChapterId,
  selectedVerseNumber,
  onChapterIdChange,
  onVerseNumberChange,
}) => {
  const chapterData = getAllChaptersData();
  const verses = generateChapterVersesKeys(selectedChapterId);

  return (
    <div className={styles.surahAndAyahSelectionContainer}>
      <Select
        size={SelectSize.Small}
        id="surah-selection"
        name="surah-selection"
        options={Object.entries(chapterData).map(([id, chapter]) => ({
          label: chapter.transliteratedName,
          value: id,
        }))}
        onChange={onChapterIdChange}
        value={selectedChapterId}
      />
      <div className={styles.selectAyah}>
        <Select
          size={SelectSize.Small}
          id="ayah-selection"
          name="ayah-selection"
          options={verses.map((verseKey) => {
            const verseNumber = getVerseNumberFromKey(verseKey).toString();
            return {
              label: verseNumber,
              value: verseNumber,
            };
          })}
          onChange={onVerseNumberChange}
          value={selectedVerseNumber}
        />
      </div>
    </div>
  );
};

export default SurahAndAyahSelection;
