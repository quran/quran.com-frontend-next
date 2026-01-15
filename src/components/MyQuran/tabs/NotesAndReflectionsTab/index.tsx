/* eslint-disable i18next/no-literal-string */

import { useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import SignInPrompt from '@/components/MyQuran/SignInPrompt';
import MyQuranTab from '@/components/MyQuran/tabs';
import BasicSwitcher from '@/components/MyQuran/tabs/NotesAndReflectionsTab/BasicSwitcher';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import { logEvent } from '@/utils/eventLogger';
import { getMyQuranNavigationUrl } from '@/utils/navigation';

enum SubTab {
  Notes = 'notes',
  Reflections = 'reflections',
}

const tabComponents = {
  [SubTab.Notes]: <div>NotesComingSoon</div>,
  [SubTab.Reflections]: <div>ReflectionsComingSoon</div>,
};

const NotesAndReflectionsTab = () => {
  const { t } = useTranslation('my-quran');
  const { isLoggedIn } = useIsLoggedIn();
  const [selectedSubTab, setSelectedSubTab] = useState(SubTab.Notes);

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
      <BasicSwitcher tabs={tabs} onSelect={onSubTabChange} selected={selectedSubTab} />

      {tabComponents[selectedSubTab]}
    </>
  );
};

export default NotesAndReflectionsTab;
