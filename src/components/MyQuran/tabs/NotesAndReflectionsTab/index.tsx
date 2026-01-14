import useTranslation from 'next-translate/useTranslation';

import SignInPrompt from '../../SignInPrompt';

import MyQuranTab from '@/components/MyQuran/tabs';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import { getMyQuranNavigationUrl } from '@/utils/navigation';

const NotesAndReflectionsTab = () => {
  const { t } = useTranslation('my-quran');
  const { isLoggedIn } = useIsLoggedIn();

  if (!isLoggedIn) {
    return (
      <SignInPrompt
        title={t('sign-in-prompt.title')}
        features={[
          t('sign-in-prompt.features.custom-collections'),
          t('sign-in-prompt.features.attach-notes'),
        ]}
        redirectUrl={getMyQuranNavigationUrl(MyQuranTab.NOTES_AND_REFLECTIONS)}
      />
    );
  }

  // TODO: Show actual notes and reflections content when logged in
  return null;
};

export default NotesAndReflectionsTab;
