import { useMemo, useState } from 'react';

import classNames from 'classnames';
import { GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import layoutStyle from './index.module.scss';
import pageStyle from './random.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import SurahInput from '@/components/Random/SurahInput';
import Toolbar from '@/components/Random/Toolbar';
import Button, { ButtonType, ButtonVariant } from '@/dls/Button/Button';
import Input, { InputVariant } from '@/dls/Forms/Input';
import Tabs from '@/dls/Tabs/Tabs';
import Toggle from '@/dls/Toggle/Toggle';
import SearchIcon from '@/icons/search.svg';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, shouldUseMinimalLayout, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';
import ChaptersData from 'types/ChaptersData';

type ReciterPageProps = {
  chaptersData: ChaptersData;
};

const NAVIGATION_URL = '/random';

const RandomizerPage = ({ chaptersData }: ReciterPageProps) => {
  const { t, lang } = useTranslation('random');
  const [view, setView] = useState('all');

  const TABS = useMemo(
    () => [
      { title: t('all'), value: 'all' },
      { title: t('selected'), value: 'selected' },
    ],
    [t],
  );

  return (
    <>
      <NextSeoWrapper
        title={t('title')}
        canonical={getCanonicalUrl(lang, NAVIGATION_URL)}
        languageAlternates={getLanguageAlternates(NAVIGATION_URL)}
        description={t('desc')}
      />
      <div className={classNames(layoutStyle.pageContainer)}>
        <div className={pageStyle.flow}>
          <div className={pageStyle.flowItem}>
            <Input
              id="searchQuery"
              prefix={<SearchIcon />}
              clearable
              placeholder={t('search')}
              fixedWidth={false}
              variant={InputVariant.Main}
            />
          </div>
          <div className={pageStyle.flowItem}>
            <Toolbar />
          </div>
          <div className={pageStyle.flowItem}>
            <Tabs tabs={TABS} selected={view} onSelect={setView} />
          </div>
          <div className={pageStyle.flowItem}>
            <div className={pageStyle.surahLayout}>
              {Object.entries(chaptersData).map(
                ([chapterId, { transliteratedName, versesCount }]) => (
                  <div className={pageStyle.chapterContainer} key={chapterId}>
                    <SurahInput
                      chapterId={Number(chapterId)}
                      description={`${toLocalizedNumber(versesCount, lang)} ${t('common:ayahs')}`}
                      surahName={transliteratedName}
                      surahNumber={Number(chapterId)}
                      versesCount={versesCount}
                      isMinimalLayout={shouldUseMinimalLayout(lang)}
                    />
                  </div>
                ),
              )}
            </div>
          </div>
          <div className={pageStyle.flowItem}>
            <Toolbar />
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const chaptersData = await getAllChaptersData(locale);

    return {
      props: {
        chaptersData,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};

export default RandomizerPage;
