import React, { memo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './SelectorContainer.module.scss';

import Combobox from '@/dls/Forms/Combobox';

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
  const { t } = useTranslation('common');
  return (
    <div className={styles.selectedContainer}>
      <Combobox
        id={type}
        value={value}
        clearable={false}
        items={dropdownItems}
        onChange={onChange}
        placeholder={t('audio.player.search-verse')}
        initialInputValue={value}
        fixedWidth={false}
        disabled={isDisabled}
        label={
          <span className={styles.comboboxLabel}>
            {`${type === RangeSelectorType.START ? t('from') : t('to')} ${t('verse')}:`}
          </span>
        }
      />
    </div>
  );
};

export default memo(SelectorContainer);
