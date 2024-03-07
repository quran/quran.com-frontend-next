import React, { useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './Tabs.module.scss';

import PrivateNotesTab from '@/components/Notes/NotesPage/Tabs/MyPrivateNotesTab';
import PublicReflectionsTab from '@/components/Notes/NotesPage/Tabs/MyPublicReflectionsTab';
import TabSwitcherItem from '@/components/Notes/NotesPage/Tabs/TabSwitcherItem';
import Switch from '@/dls/Switch/Switch';
import useAddQueryParamsToUrl from '@/hooks/useAddQueryParamsToUrl';
import DetailsIcon from '@/icons/collection.svg';
import SyllabusIcon from '@/icons/developers.svg';
import { logEvent } from '@/utils/eventLogger';
import { getNotesNavigationUrl } from '@/utils/navigation';

enum Tab {
  PRIVATE_NOTES = 'notes',
  PUBLIC_REFLECTIONS = 'reflections',
}

const NotesTabs = () => {
  const { t } = useTranslation('notes');
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(Tab.PRIVATE_NOTES);

  const queryParams = useMemo(
    () => ({
      tab: selectedTab,
    }),
    [selectedTab],
  );
  useAddQueryParamsToUrl(getNotesNavigationUrl(), queryParams);

  // listen to the query param to update the selected tab
  useEffect(() => {
    const queryTab = router.query.tab as Tab;
    // validate the query param is a valid tab value
    if (queryTab && Object.values(Tab).includes(queryTab)) {
      setSelectedTab(queryTab);
    }
  }, [router.query.tab]);

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
        name: <TabSwitcherItem icon={<SyllabusIcon />} value={t('posted-reflections')} />,
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

  if (!router.isReady) {
    return <></>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <h1>{t('common:notes.title')}</h1>
        </div>
      </div>
      <Switch selected={selectedTab} items={tabs} onSelect={onTabChange} />
      {tabComponents[selectedTab]}
    </div>
  );
};

export default NotesTabs;
