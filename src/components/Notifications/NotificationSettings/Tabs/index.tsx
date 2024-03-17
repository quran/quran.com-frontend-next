import React, { useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Tabs.module.scss';

import CategoriesSettingsTab from '@/components/Notifications/NotificationSettings/Tabs/CategoriesSettingsTab';
import GlobalSettingsTab from '@/components/Notifications/NotificationSettings/Tabs/GlobalSettingsTab';
import TabSwitcherItem from '@/components/Notifications/NotificationSettings/Tabs/TabSwitcherItem';
import Switch from '@/dls/Switch/Switch';
import { logEvent } from '@/utils/eventLogger';

enum Tab {
  GLOBAL_SETTINGS = 'globalSettings',
  CATEGORIES_SETTINGS = 'categoriesSettings',
}

const NotificationSettingsTabs = () => {
  const { t } = useTranslation('notification-settings');
  const [selectedTab, setSelectedTab] = useState(Tab.GLOBAL_SETTINGS);

  const onTabChange = (value: Tab) => {
    logEvent('notif_settings_page_tab_change', { value });
    setSelectedTab(value);
  };

  const tabs = useMemo(
    () => [
      {
        name: <TabSwitcherItem value={t('tabs.global-settings')} />,
        value: Tab.GLOBAL_SETTINGS,
      },
      {
        name: <TabSwitcherItem value={t('tabs.categories-settings')} />,
        value: Tab.CATEGORIES_SETTINGS,
      },
    ],
    [t],
  );

  const tabComponents = useMemo(
    () => ({
      [Tab.GLOBAL_SETTINGS]: <GlobalSettingsTab />,
      [Tab.CATEGORIES_SETTINGS]: <CategoriesSettingsTab />,
    }),
    [],
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <h1>{t('common:notification-settings')}</h1>
        </div>
      </div>
      <Switch selected={selectedTab} items={tabs} onSelect={onTabChange} />
      {tabComponents[selectedTab]}
    </div>
  );
};

export default NotificationSettingsTabs;
