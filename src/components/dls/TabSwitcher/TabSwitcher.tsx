import React from 'react';

import styles from './TabSwitcher.module.scss';

import Switch, { SwitchSize, SwitchVariant } from '@/dls/Switch/Switch';
import Tabs, { Tab } from '@/dls/Tabs/Tabs';
import useIsMobile from '@/hooks/useIsMobile';

type TabSwitcherItem = {
  name: React.ReactNode;
  value: string;
  id?: string;
};

interface TabSwitcherProps {
  items: TabSwitcherItem[];
  selected: string;
  onSelect: (value: string) => void;
  hasSeparator?: boolean;
  size?: SwitchSize;
  variant?: SwitchVariant;
}

const TabSwitcher: React.FC<TabSwitcherProps> = ({
  items,
  selected,
  onSelect,
  hasSeparator = true,
  size = SwitchSize.Normal,
  variant = SwitchVariant.Default,
}) => {
  const isMobile = useIsMobile();

  const tabs: Tab[] = items.map((item) => ({
    title: item.name,
    value: item.value,
    id: item.id,
  }));

  if (isMobile) {
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
      </div>
    );
  }

  return (
    <div className={styles.tabSwitcherContainer}>
      <Switch
        containerClassName={styles.switchContainer}
        items={items}
        selected={selected}
        onSelect={onSelect}
        hasSeparator={hasSeparator}
        size={size}
        variant={variant}
        buttonClassName={styles.switchButton}
      />
    </div>
  );
};

export default TabSwitcher;
