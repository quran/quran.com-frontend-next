import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './RepeatSetting.module.scss';

import { RangeSelectorType } from '@/components/Verse/AdvancedCopy/SelectorContainer';
import VerseRangeSelector from '@/components/Verse/AdvancedCopy/VersesRangeSelector';
import Combobox from '@/dls/Forms/Combobox';
import Switch from '@/dls/Switch/Switch';
import { toLocalizedVerseKey } from '@/utils/locale';

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
          initialInputValue={verseKey ? toLocalizedVerseKey(verseKey, lang) : null}
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
            rangeStartVerse={rangeStartVerse ? toLocalizedVerseKey(rangeStartVerse, lang) : null}
            rangeEndVerse={rangeEndVerse ? toLocalizedVerseKey(rangeEndVerse, lang) : null}
          />
        </div>
      )}
    </>
  );
};

export default SelectRepetitionMode;
