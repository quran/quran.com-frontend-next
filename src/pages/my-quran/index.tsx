/* eslint-disable max-lines */
import { useEffect, useMemo, useState } from 'react';

import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './my-quran.module.scss';

import HeaderNavigation from '@/components/HeaderNavigation';
import SavedTabContent from '@/components/MyQuran/SavedTabContent';
import MyQuranTab from '@/components/MyQuran/tabs';
import NotesAndReflectionsTab from '@/components/MyQuran/tabs/NotesAndReflectionsTab';
import RecentContent from '@/components/MyQuran/tabs/RecentContent/RecentContent';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import TabSwitcher from '@/dls/TabSwitcher/TabSwitcher';
import { getAllChaptersData } from '@/utils/chapter';
import { logEvent } from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getMyQuranNavigationUrl } from '@/utils/navigation';
import withSsrRedux from '@/utils/withSsrRedux';

const MY_QURAN_PATH = getMyQuranNavigationUrl();
const tabComponents = {
  [MyQuranTab.SAVED]: <SavedTabContent />,
  [MyQuranTab.RECENT]: <RecentContent />,
  [MyQuranTab.NOTES_AND_REFLECTIONS]: <NotesAndReflectionsTab />,
};

const MyQuranPage = (): JSX.Element => {
  const { lang, t } = useTranslation('my-quran');
  const router = useRouter();
  const { tab } = router.query;
  const [selectedTab, setSelectedTab] = useState(MyQuranTab.SAVED);

  const title = t('common:my-quran');

  const tabs = useMemo(
    () => [
      {
        name: t('saved'),
        value: MyQuranTab.SAVED,
      },
      {
        name: t('recent'),
        value: MyQuranTab.RECENT,
      },
      {
        name: t('notes-and-reflections'),
        value: MyQuranTab.NOTES_AND_REFLECTIONS,
      },
    ],
    [t],
  );

  const onTabChange = (value: string) => {
    logEvent('my_quran_tab_change', { value });
    setSelectedTab(value as MyQuranTab);
    if (tab) router.replace(router.pathname, undefined, { shallow: true });
  };

  useEffect(() => {
    if (tab && Object.values(MyQuranTab).includes(tab as MyQuranTab)) {
      setSelectedTab(tab as MyQuranTab);
    }
  }, [tab]);

  return (
    <>
      <NextSeoWrapper
        title={title}
        canonical={getCanonicalUrl(lang, MY_QURAN_PATH)}
        languageAlternates={getLanguageAlternates(MY_QURAN_PATH)}
        nofollow
        noindex
      />
      <main className={styles.main}>
        <HeaderNavigation title={title} innerClassName={styles.headerNavigationInnerClassName} />
        <PageContainer
          isSheetsLike
          wrapperClassName={styles.mainContent}
          className={styles.pageContainer}
        >
          <TabSwitcher selected={selectedTab} items={tabs} onSelect={onTabChange} />
          <div className={styles.tabContent}>{tabComponents[selectedTab]}</div>
        </PageContainer>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/profile',
  async ({ locale }, languageResult) => {
    const allChaptersData = await getAllChaptersData(locale);

    return {
      props: {
        chaptersData: allChaptersData,
        ...(languageResult.countryLanguagePreference && {
          countryLanguagePreference: languageResult.countryLanguagePreference,
        }),
      },
    };
  },
);

export default MyQuranPage;
