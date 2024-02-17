import React, { useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Tabs.module.scss';

import Button, { ButtonVariant } from '@/components/dls/Button/Button';
import PrivateNotesTab from '@/components/Notes/NotesPage/Tabs/MyPrivateNotesTab';
import PublicReflectionsTab from '@/components/Notes/NotesPage/Tabs/MyPublicReflectionsTab';
import TabSwitcherItem from '@/components/Notes/NotesPage/Tabs/TabSwitcherItem';
import Switch from '@/dls/Switch/Switch';
import DetailsIcon from '@/icons/collection.svg';
import SyllabusIcon from '@/icons/developers.svg';
import ArrowLeft from '@/icons/west.svg';
import { logEvent, logButtonClick } from '@/utils/eventLogger';

enum Tab {
  PRIVATE_NOTES = 'private_notes',
  PUBLIC_REFLECTIONS = 'public_reflections',
}

const Tabs = () => {
  const { t } = useTranslation('notes');
  const [selectedTab, setSelectedTab] = useState(Tab.PRIVATE_NOTES);

  const onTabChange = (value: Tab) => {
    logEvent('notes_page_tab_change', { value });
    setSelectedTab(value);
  };

  const tabs = useMemo(
    () => [
      {
        name: <TabSwitcherItem icon={<DetailsIcon />} value={t('private-notes')} />,
        value: Tab.PRIVATE_NOTES,
      },
      {
        name: <TabSwitcherItem icon={<SyllabusIcon />} value={t('public-reflections')} />,
        value: Tab.PUBLIC_REFLECTIONS,
      },
    ],
    [t],
  );

  const tabComponents = useMemo(
    () => ({
      [Tab.PRIVATE_NOTES]: <PrivateNotesTab />,
      [Tab.PUBLIC_REFLECTIONS]: <PublicReflectionsTab />,
    }),
    [],
  );

  const onBackButtonClicked = () => {
    logButtonClick('notes_page_back_button');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <Button
            onClick={onBackButtonClicked}
            href="/"
            variant={ButtonVariant.Ghost}
            hasSidePadding={false}
          >
            <ArrowLeft />
          </Button>
          <h1>{t('common:notes.my-notes')}</h1>
        </div>
      </div>
      <Switch selected={selectedTab} items={tabs} onSelect={onTabChange} />
      {tabComponents[selectedTab]}
    </div>
  );
};

export default Tabs;
