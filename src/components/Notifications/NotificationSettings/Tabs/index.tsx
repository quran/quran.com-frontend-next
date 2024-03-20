import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Tabs.module.scss';

import CategoriesSettingsTab from '@/components/Notifications/NotificationSettings/Tabs/CategoriesSettingsTab';

const NotificationSettingsTabs = () => {
  const { t } = useTranslation('notification-settings');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <h1>{t('common:notification-settings')}</h1>
        </div>
      </div>
      <CategoriesSettingsTab />
    </div>
  );
};

export default NotificationSettingsTabs;
