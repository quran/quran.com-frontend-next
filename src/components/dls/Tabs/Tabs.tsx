/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */

import classNames from 'classnames';

import styles from './Tabs.module.scss';

type Tab = {
  title: string;
  value: string;
};
type TabsProps = {
  tabs: Tab[];
  selected: string;
  onSelect: (value: string) => void;
  isDisabled?: boolean;
};

const Tabs = ({ tabs, onSelect, selected }: TabsProps) => {
  return (
    <div className={styles.container}>
      {tabs.map((tab) => (
        <div
          className={classNames(styles.tabItem, selected === tab.value && styles.tabItemSelected)}
          key={tab.value}
          role="tab"
          onClick={() => onSelect(tab.value)}
        >
          {tab.title}
        </div>
      ))}
    </div>
  );
};

export default Tabs;
