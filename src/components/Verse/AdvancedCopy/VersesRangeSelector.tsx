import React from 'react';
import classNames from 'classnames';
import styles from './VersesRangeSelector.module.scss';
import SelectorContainer, { RangeSelectorType, RangeVerseItem } from './SelectorContainer';

interface Props {
  dropdownItems: RangeVerseItem[];
  rangeStartVerse: string;
  rangeEndVerse: string;
  onChange: (selectedName: string, dropdownId: RangeSelectorType) => void;
  isVisible: boolean;
}

const VersesRangeSelector: React.FC<Props> = ({
  dropdownItems,
  rangeStartVerse,
  rangeEndVerse,
  onChange,
  isVisible,
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
    />
    <SelectorContainer
      value={rangeEndVerse}
      type={RangeSelectorType.END}
      dropdownItems={dropdownItems}
      onChange={onChange}
    />
  </div>
);

export default VersesRangeSelector;
