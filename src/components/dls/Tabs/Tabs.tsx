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
  hasBorderBottom?: boolean;
};

const Tabs = ({ tabs, onSelect, selected, hasBorderBottom = true }: TabsProps) => {
  return (
    <div className={styles.container}>
      {tabs.map((tab, index) => (
        <div
          className={classNames(
            styles.tabItem,
            selected === tab.value && styles.tabItemSelected,
            hasBorderBottom && styles.hasBorderBottom,
          )}
          key={tab.value}
          role="tab"
          tabIndex={index}
          onKeyDown={() => onSelect(tab.value)}
          onClick={() => onSelect(tab.value)}
        >
          {tab.title}
        </div>
      ))}
    </div>
  );
};

export default Tabs;
