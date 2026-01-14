import { useEffect, useMemo, useState } from 'react';

import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './my-quran.module.scss';
import RecentContent from './tabs/RecentContent/RecentContent';

import HeaderNavigation from '@/components/HeaderNavigation';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import TabSwitcher from '@/dls/TabSwitcher/TabSwitcher';
import { getAllChaptersData } from '@/utils/chapter';
import { logEvent } from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, ROUTES } from '@/utils/navigation';

enum Tab {
  SAVED = 'saved',
  RECENT = 'recent',
  NOTES_AND_REFLECTIONS = 'notes-and-reflections',
}

const MyQuranPage = (): JSX.Element => {
  const { lang, t } = useTranslation('my-quran');
  const router = useRouter();
  const { tab } = router.query;
  const PATH = ROUTES.MY_QURAN;
  const title = t('common:my-quran');
  const [selectedTab, setSelectedTab] = useState(Tab.SAVED);

  const tabs = useMemo(
    () => [
      {
        name: t('saved'),
        value: Tab.SAVED,
      },
      {
        name: t('recent'),
        value: Tab.RECENT,
      },
      {
        name: t('notes-and-reflections'),
        value: Tab.NOTES_AND_REFLECTIONS,
      },
    ],
    [t],
  );

  const onTabChange = (value: string) => {
    logEvent('my_quran_tab_change', { value });
    setSelectedTab(value as Tab);
  };

  const tabComponents = {
    [Tab.SAVED]: null,
    [Tab.RECENT]: <RecentContent />,
    [Tab.NOTES_AND_REFLECTIONS]: null,
  };

  useEffect(() => {
    if (tab && Object.values(Tab).includes(tab as Tab)) {
      setSelectedTab(tab as Tab);
    }
  }, [tab]);

  return (
    <>
      <NextSeoWrapper
        title={title}
        canonical={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
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
          <TabSwitcher
            hasSeparator={false}
            selected={selectedTab}
            items={tabs}
            onSelect={onTabChange}
          />
          <div className={styles.tabContent}>{tabComponents[selectedTab]}</div>
        </PageContainer>
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const allChaptersData = await getAllChaptersData(locale);

  return {
    props: {
      chaptersData: allChaptersData,
    },
  };
};

export default MyQuranPage;
