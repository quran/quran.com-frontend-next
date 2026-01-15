import { useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './NotesAndReflectionsTab.module.scss';

import SignInPrompt from '@/components/MyQuran/SignInPrompt';
import MyQuranTab from '@/components/MyQuran/tabs';
import BasicSwitcher from '@/components/MyQuran/tabs/NotesAndReflectionsTab/BasicSwitcher';
import NotesSorter from '@/components/MyQuran/tabs/NotesAndReflectionsTab/NotesSorter/NotesSorter';
import NotesTab from '@/components/MyQuran/tabs/NotesAndReflectionsTab/NotesTab';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import NotesSortOption from '@/types/NotesSortOptions';
import { logEvent } from '@/utils/eventLogger';
import { getMyQuranNavigationUrl } from '@/utils/navigation';

enum SubTab {
  Notes = 'notes',
  Reflections = 'reflections',
}

const NotesAndReflectionsTab = () => {
  const { t } = useTranslation('my-quran');
  const { isLoggedIn } = useIsLoggedIn();

  const [selectedSubTab, setSelectedSubTab] = useState(SubTab.Notes);
  const [sortOption, setSortOption] = useState(NotesSortOption.Newest);

  const onSubTabChange = (value: string) => {
    logEvent('my_quran_notes_reflections_subtab_change', { value });
    setSelectedSubTab(value as SubTab);
  };

  const features = useMemo(
    () => [
      t('sign-in-prompt.features.custom-collections'),
      t('sign-in-prompt.features.attach-notes'),
    ],
    [t],
  );

  const tabs = useMemo(
    () => [
      { name: t('notes:private-notes'), value: SubTab.Notes },
      { name: t('notes:posted-reflections'), value: SubTab.Reflections },
    ],
    [t],
  );

  const sortOptions = useMemo(
    () => [
      { id: NotesSortOption.Newest, label: t('common:newest') },
      { id: NotesSortOption.Oldest, label: t('common:oldest') },
    ],
    [t],
  );

  const tabComponents = useMemo(
    () => ({
      [SubTab.Notes]: <NotesTab sortBy={sortOption} />,
      [SubTab.Reflections]: null,
    }),
    [sortOption],
  );

  const onSortByChange = (value: NotesSortOption) => {
    logEvent('my_quran_notes_reflections_sort_by_change', { value });
    setSortOption(value);
  };

  if (!isLoggedIn) {
    return (
      <SignInPrompt
        title={t('sign-in-prompt.title')}
        features={features}
        redirectUrl={getMyQuranNavigationUrl(MyQuranTab.NOTES_AND_REFLECTIONS)}
      />
    );
  }

  return (
    <>
      <div className={styles.header}>
        <BasicSwitcher tabs={tabs} onSelect={onSubTabChange} selected={selectedSubTab} />
        {selectedSubTab === SubTab.Notes && (
          <NotesSorter
            options={sortOptions}
            selectedOptionId={sortOption}
            onChange={onSortByChange}
          />
        )}
      </div>

      {tabComponents[selectedSubTab]}
    </>
  );
};

export default NotesAndReflectionsTab;
