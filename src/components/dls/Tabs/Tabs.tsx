import classNames from 'classnames';

import styles from './Tabs.module.scss';

type Tab = {
  title: string;
  value: string;
};
type TabsProps = {
  tabs: Tab[];
  selected: string;
  onSelect?: (value: string) => void;
};

const Tabs = ({ tabs, onSelect, selected }: TabsProps) => {
  return (
    <div className={styles.container} role="tablist">
      {tabs.map((tab) => (
        <div
          className={classNames(styles.tabItem, selected === tab.value && styles.tabItemSelected)}
          key={tab.value}
          role="tab"
          tabIndex={0}
          {...(onSelect && {
            onKeyDown: () => onSelect(tab.value),
            onClick: () => onSelect(tab.value),
          })}
        >
          {tab.title}
        </div>
      ))}
    </div>
  );
};

export default Tabs;
