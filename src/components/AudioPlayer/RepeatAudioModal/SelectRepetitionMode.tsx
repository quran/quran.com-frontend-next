import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './RepeatSetting.module.scss';

import Combobox from 'src/components/dls/Forms/Combobox';
import Switch from 'src/components/dls/Switch/Switch';
import { RangeSelectorType } from 'src/components/Verse/AdvancedCopy/SelectorContainer';
import VerseRangeSelector from 'src/components/Verse/AdvancedCopy/VersesRangeSelector';

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
  const { t } = useTranslation('common');
  const repetitionModeItems = useMemo(
    () => [
      {
        value: RepetitionMode.Single,
        name: t('audio.player.single-verse'),
      },

      {
        value: RepetitionMode.Range,
        name: t('audio.player.verses-range'),
      },
      {
        value: RepetitionMode.Chapter,
        name: t('audio.player.full-surah'),
      },
    ],
    [t],
  );

  return (
    <>
      <div className={styles.switchContainer}>
        <Switch
          items={repetitionModeItems}
          selected={repetitionMode}
          onSelect={onRepetitionModeChange}
        />
      </div>
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
    </>
  );
};

export default SelectRepetitionMode;
