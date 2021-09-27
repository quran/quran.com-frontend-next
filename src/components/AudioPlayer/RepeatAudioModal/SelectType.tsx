import { useState } from 'react';

import Combobox from 'src/components/dls/Forms/Combobox';
import RadioGroup, { RadioGroupOrientation } from 'src/components/dls/Forms/RadioGroup/RadioGroup';
import { RangeSelectorType } from 'src/components/Verse/AdvancedCopy/SelectorContainer';
import VerseRangeSelector from 'src/components/Verse/AdvancedCopy/VersesRangeSelector';

export enum RepeatType {
  Single = 'single',
  Range = 'range',
}

const repeatTypeRadioGroupItems = [
  {
    value: RepeatType.Single,
    id: RepeatType.Single,
    label: 'Single Verse',
  },
  {
    value: RepeatType.Range,
    id: RepeatType.Range,
    label: 'Range of verses',
  },
];

const SelectType = ({
  comboboxVerseItems,
  rangeStartVerse,
  rangeEndVerse,
  defaultRepeatType,
  onSingleVerseChange,
  onRangeChange,
  verseKey,
}) => {
  const [repeatType, setRepeatType] = useState(defaultRepeatType);

  const onRangeTypeChange = (val) => {
    setRepeatType(val);
  };

  return (
    <>
      <RadioGroup
        label="Select verses range"
        orientation={RadioGroupOrientation.Horizontal}
        onChange={onRangeTypeChange}
        value={repeatType}
        items={repeatTypeRadioGroupItems}
      />
      {repeatType === RepeatType.Single && (
        <Combobox
          clearable={false}
          id={RepeatType.Single}
          value={verseKey}
          items={comboboxVerseItems}
          onChange={(val) => onSingleVerseChange(val)}
          placeholder="Search for a verse"
          initialInputValue={verseKey}
        />
      )}
      {repeatType === RepeatType.Range && (
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

export default SelectType;
