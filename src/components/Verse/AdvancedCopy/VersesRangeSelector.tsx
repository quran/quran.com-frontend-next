import React, { memo } from 'react';
import classNames from 'classnames';
import styles from './VersesRangeSelector.module.scss';
import SearchDropdown from '../../dls/Forms/SearchDropdown/SearchDropdown';

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

interface Props {
  dropdownItems: RangeVerseItem[];
  rangeStartVerse: string;
  rangeEndVerse: string;
  onSelect: (selectedName: string, dropdownId: RangeSelectorType) => void;
  isVisible: boolean;
}

interface SelectorProps {
  type: RangeSelectorType;
  selectedItem: string;
  dropdownItems: RangeVerseItem[];
  onSelect: (selectedName: string, dropdownId: string) => void;
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
const SelectorContainer: React.FC<SelectorProps> = memo(
  ({ type, selectedItem, dropdownItems, onSelect }) => (
    <div className={styles.selectedContainer}>
      <SearchDropdown
        id={type}
        selectedItem={selectedItem}
        items={dropdownItems}
        onSelect={onSelect}
        searchPlaceHolder="Search for a verse"
        selectorText={selectedItem}
        label={
          <span className={styles.searchDropdownLabel}>
            {type === RangeSelectorType.START ? 'From' : 'To'} Verse:
          </span>
        }
      />
    </div>
  ),
);

const VersesRangeSelector: React.FC<Props> = ({
  dropdownItems,
  rangeStartVerse,
  rangeEndVerse,
  onSelect,
  isVisible,
}) => {
  return (
    <div
      className={classNames(styles.rangeSelectorContainer, {
        [styles.selectorsContainerInvisible]: !isVisible,
      })}
    >
      <SelectorContainer
        selectedItem={rangeStartVerse}
        type={RangeSelectorType.START}
        dropdownItems={dropdownItems}
        onSelect={onSelect}
      />
      <SelectorContainer
        selectedItem={rangeEndVerse}
        type={RangeSelectorType.END}
        dropdownItems={dropdownItems}
        onSelect={onSelect}
      />
    </div>
  );
};

export default VersesRangeSelector;
