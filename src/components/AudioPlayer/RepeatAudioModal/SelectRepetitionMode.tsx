import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import Combobox from 'src/components/dls/Forms/Combobox';
import RadioGroup, { RadioGroupOrientation } from 'src/components/dls/Forms/RadioGroup/RadioGroup';
import { RangeSelectorType } from 'src/components/Verse/AdvancedCopy/SelectorContainer';
import VerseRangeSelector from 'src/components/Verse/AdvancedCopy/VersesRangeSelector';
import { getAllChaptersData, getChapterData } from 'src/utils/chapter';
import { makeVerseKey } from 'src/utils/verse';

export enum RepetitionMode {
  Single = 'single',
  Range = 'range',
  Chapter = 'chapter',
}

const SelectRepetitionMode = ({
  comboboxVerseItems,
  rangeStartVerse,
  rangeEndVerse,
  onSingleVerseChange,
  repetitionMode,
  onRangeChange,
  onRepetitionModeChange,
  verseKey,
}) => {
  const { t, lang } = useTranslation('common');
  const repetitionModeRadioGroupItems = useMemo(
    () => [
      {
        value: RepetitionMode.Single,
        id: RepetitionMode.Single,
        label: t('audio.player.single-verse'),
      },
      {
        value: RepetitionMode.Range,
        id: RepetitionMode.Range,
        label: t('audio.player.verses-range'),
      },
      {
        value: RepetitionMode.Chapter,
        id: RepetitionMode.Chapter,
        label: t('surah'),
      },
    ],
    [t],
  );

  const surahList = useMemo(() => {
    const chapterData = getAllChaptersData(lang);

    const initialState = Object.entries(chapterData).map(([id, chapter]) => ({
      id,
      name: id,
      value: id,
      label: chapter.transliteratedName,
    }));

    return initialState;
  }, [lang]);

  return (
    <>
      <RadioGroup
        label="range"
        orientation={RadioGroupOrientation.Horizontal}
        onChange={onRepetitionModeChange}
        value={repetitionMode}
        items={repetitionModeRadioGroupItems}
      />
      {repetitionMode === RepetitionMode.Single && (
        <Combobox
          clearable={false}
          id={RepetitionMode.Single}
          value={verseKey}
          items={comboboxVerseItems}
          onChange={(val) => onSingleVerseChange(val)}
          placeholder={t('audio.player.search-verse')}
          initialInputValue={verseKey}
        />
      )}
      {repetitionMode === RepetitionMode.Range && (
        <div>
          <VerseRangeSelector
            onChange={(value, dropdownId) => {
              if (dropdownId === RangeSelectorType.END) onRangeChange({ to: value });
              else onRangeChange({ from: value });
            }}
            dropdownItems={comboboxVerseItems}
            isVisible
            rangeStartVerse={rangeStartVerse}
            rangeEndVerse={rangeEndVerse}
          />
        </div>
      )}
      {repetitionMode === RepetitionMode.Chapter && (
        <Combobox
          clearable={false}
          id={RepetitionMode.Chapter}
          value="1"
          items={surahList}
          onChange={(val) => {
            const chapterData = getChapterData(val.toString(), lang);
            onRangeChange({
              from: makeVerseKey(Number(val), 1),
              to: makeVerseKey(Number(val), chapterData.versesCount),
            });
          }}
          placeholder={t('audio.player.search-verse')}
          initialInputValue="1"
        />
      )}
    </>
  );
};

export default SelectRepetitionMode;
