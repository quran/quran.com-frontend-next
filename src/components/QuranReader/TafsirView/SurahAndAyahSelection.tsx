import styles from './TafsirView.module.scss';

import Select, { SelectSize } from 'src/components/dls/Forms/Select';
import { getAllChaptersData } from 'src/utils/chapter';
import { generateChapterVersesKeys, getVerseNumberFromKey } from 'src/utils/verse';

const SurahAndAyahSelection = ({
  chapterId,
  verseNumber,
  onChapterIdChange,
  onVerseNumberChange,
}) => {
  const chapterData = getAllChaptersData();
  const verses = generateChapterVersesKeys(chapterId);

  return (
    <div className={styles.surahAndAyahSelectionContainer}>
      <Select
        size={SelectSize.Small}
        id="surah-selection"
        name="surah-selection"
        options={Object.values(chapterData).map((chapter) => ({
          label: chapter.transliteratedName,
          value: chapter.id,
        }))}
        onChange={onChapterIdChange}
        value={chapterId}
      />
      <div style={{ marginInlineStart: '1rem' }}>
        <Select
          size={SelectSize.Small}
          id="ayah-selection"
          name="ayah-selection"
          options={verses.map((verseKey) => ({
            label: getVerseNumberFromKey(verseKey).toString(),
            value: verseKey,
          }))}
          onChange={onVerseNumberChange}
          value={verseNumber}
        />
      </div>
    </div>
  );
};

export default SurahAndAyahSelection;
