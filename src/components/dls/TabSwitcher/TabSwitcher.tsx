import React from 'react';

import styles from './TabSwitcher.module.scss';

import Switch, { SwitchSize, SwitchVariant } from '@/dls/Switch/Switch';
import Tabs, { Tab } from '@/dls/Tabs/Tabs';
import useIsMobile from '@/hooks/useIsMobile';

type TabSwitcherItem = {
  name: React.ReactNode;
  value: string;
  disabled?: boolean;
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

  if (isMobile) {
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
      </div>
    );
  }

  return (
    <div className={styles.tabSwitcherContainer}>
      <Switch
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
