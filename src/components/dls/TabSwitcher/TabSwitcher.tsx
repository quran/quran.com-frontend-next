import React from 'react';

import styles from './TabSwitcher.module.scss';

import Switch, { SwitchSize, SwitchVariant } from '@/dls/Switch/Switch';
import Tabs, { Tab } from '@/dls/Tabs/Tabs';

type TabSwitcherItem = {
  name: React.ReactNode;
  value: string;
  id?: string;
};

interface TabSwitcherProps {
  items: TabSwitcherItem[];
  selected: string;
  onSelect: (value: string) => void;
  shouldHideSeparators?: boolean;
  size?: SwitchSize;
  variant?: SwitchVariant;
}

const TabSwitcher: React.FC<TabSwitcherProps> = ({
  items,
  selected,
  onSelect,
  shouldHideSeparators = true,
  size = SwitchSize.Normal,
  variant = SwitchVariant.Default,
}) => {
  const tabs: Tab[] = items.map((item) => ({
    title: item.name,
    value: item.value,
    id: item.id,
  }));

  return (
    <div className={styles.tabSwitcherContainer}>
      <Tabs
        tabs={tabs}
        selected={selected}
        onSelect={onSelect}
        containerClassName={styles.tabsContainer}
        className={styles.tabs}
        activeClassName={styles.activeTab}
      />
      <Switch
        containerClassName={styles.switchContainer}
        items={items}
        selected={selected}
        onSelect={onSelect}
        shouldHideSeparators={shouldHideSeparators}
        size={size}
        variant={variant}
        buttonClassName={styles.switchButton}
      />
    </div>
  );
};

export default TabSwitcher;
