import classNames from 'classnames';

import styles from './Tabs.module.scss';

export type Tab = {
  title: string;
  value: string;
  id?: string;
};

type TabsProps = {
  tabs: Tab[];
  selected: string;
  onSelect?: (value: string) => void;
  className?: string;
};

// TODO: move this to Radix UI Tabs component
const Tabs = ({ tabs, onSelect, selected, className }: TabsProps) => {
  return (
    <div className={styles.container} role="tablist">
      {tabs.map((tab) => (
        <div
          className={classNames(
            className,
            styles.tabItem,
            selected === tab.value && styles.tabItemSelected,
          )}
          key={tab.value}
          role="tab"
          tabIndex={0}
          id={tab.id}
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
