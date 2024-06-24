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
  boldLabels: boolean;
}

const VersesRangeSelector: React.FC<Props> = ({
  dropdownItems,
  rangeStartVerse,
  rangeEndVerse,
  onChange,
  isVisible,
  boldLabels = true,
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
      boldLabels={boldLabels}
    />
    <SelectorContainer
      value={rangeEndVerse}
      type={RangeSelectorType.END}
      dropdownItems={dropdownItems}
      onChange={onChange}
      boldLabels={boldLabels}
    />
  </div>
);

export default VersesRangeSelector;
