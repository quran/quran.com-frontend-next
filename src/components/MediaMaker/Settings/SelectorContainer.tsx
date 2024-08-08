import React, { memo } from 'react';

import styles from './SelectorContainer.module.scss';

import Select, { SelectSize } from '@/dls/Forms/Select';

export interface RangeVerseItem {
  id: string;
  value: string;
  name: string;
  label: string;
}

export enum RangeSelectorType {
  START = 'start',
  END = 'end',
}

interface SelectorProps {
  type: RangeSelectorType;
  value: string;
  dropdownItems: RangeVerseItem[];
  onChange: (selectedName: string, dropdownId: string) => void;
  isDisabled?: boolean;
}

/*
Memoizing the selector will save re-renders to each selector and its items when:
1. The state of the parent component changes because of a change in the value of any other field
    that is not related to the range e.g. which translations to include in the copying.
2. A change that happens to one of the two selectors in which the other selector and its items
    will be saved from having to re-render.

[NOTE] The more the verses of a chapter the more beneficial the memoization will be
        since we will have higher number items which will be re-rendering un-necessarily.
*/
const SelectorContainer: React.FC<SelectorProps> = ({
  type,
  value,
  dropdownItems,
  onChange,
  isDisabled = false,
}) => {
  return (
    <div className={styles.selectedContainer}>
      <Select
        id={type}
        name={type}
        options={dropdownItems || []}
        value={value}
        onChange={(changedValue) => {
          onChange(String(changedValue), type);
        }}
        disabled={isDisabled}
        size={SelectSize.Medium}
        className={styles.select}
      />
    </div>
  );
};

export default memo(SelectorContainer);
