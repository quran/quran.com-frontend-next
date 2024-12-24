import React from 'react';

import classNames from 'classnames';

import SelectorContainer, { RangeSelectorType, RangeVerseItem } from './SelectorContainer';
import styles from './VersesRangeSelector.module.scss';

interface Props {
  dropdownItems: RangeVerseItem[];
  rangeStartVerse: string;
  rangeEndVerse: string;
  onChange: (selectedName: string, dropdownId: RangeSelectorType) => void;
  isVisible: boolean;
  isDisabled?: boolean;
}

const VersesRangeSelector: React.FC<Props> = ({
  dropdownItems,
  rangeStartVerse,
  rangeEndVerse,
  onChange,
  isVisible,
  isDisabled = false,
}) => (
  <div
    className={classNames(styles.rangeSelectorContainer, {
      [styles.selectorsContainerInvisible]: !isVisible,
    })}
  >
    <SelectorContainer
      value={rangeStartVerse}
      type={RangeSelectorType.START}
      dropdownItems={dropdownItems}
      onChange={onChange}
      isDisabled={isDisabled}
    />
    <SelectorContainer
      value={rangeEndVerse}
      type={RangeSelectorType.END}
      dropdownItems={dropdownItems}
      onChange={onChange}
      isDisabled={isDisabled}
    />
  </div>
);

export default VersesRangeSelector;
