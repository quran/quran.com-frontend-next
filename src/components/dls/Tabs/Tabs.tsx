import { JSX } from 'react';

import classNames from 'classnames';

import styles from './Tabs.module.scss';

export type Tab = {
  title: string | JSX.Element;
  value: string;
  id?: string;
};

type TabsProps = {
  tabs: Tab[];
  selected: string;
  onSelect?: (value: string) => void;
  containerClassName?: string;
  className?: string;
  activeClassName?: string;
};

// TODO: move this to Radix UI Tabs component
const Tabs = ({
  tabs,
  onSelect,
  selected,
  className,
  activeClassName,
  containerClassName,
}: TabsProps) => {
  return (
    <div className={classNames(styles.container, containerClassName)} role="tablist">
      {tabs.map((tab) => (
        <div
          className={classNames(styles.tabItem, className, {
            [activeClassName]: selected === tab.value,
            [styles.tabItemSelected]: selected === tab.value && !activeClassName,
          })}
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
