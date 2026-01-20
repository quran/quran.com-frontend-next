import React from 'react';

import classNames from 'classnames';

import styles from './Tabs.module.scss';

import { TestId } from '@/tests/test-ids';

export type Tab = {
  title: React.ReactNode;
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
    <div
      className={classNames(styles.container, containerClassName)}
      role="tablist"
      data-selectedtab={selected}
      data-testid={TestId.TABS_CONTAINER}
    >
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
