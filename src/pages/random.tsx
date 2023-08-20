/* eslint-disable max-lines */
import { useCallback, useEffect, useMemo, useState } from 'react';

import classNames from 'classnames';
import { clamp } from 'lodash';
import { GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import layoutStyle from './index.module.scss';
import pageStyle from './random.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import SurahInput from '@/components/Random/SurahInput';
import Toolbar from '@/components/Random/Toolbar';
import Input, { InputVariant } from '@/dls/Forms/Input';
import Tabs from '@/dls/Tabs/Tabs';
import SearchIcon from '@/icons/search.svg';
import { SurahReadingLog, selectSurahLogs } from '@/redux/slices/QuranReader/readingTracker';
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
  const [search, setSearch] = useState('');
  const [view, setView] = useState('all');
  const [lastVerses, setLastVerses] = useState({});
  const surahLogs = useSelector(selectSurahLogs, shallowEqual);

  // Import last verses from the surah logs
  const loadPreviouslyRead = useCallback(() => {
    setLastVerses(
      // eslint-disable-next-line unicorn/no-array-reduce
      Object.values(surahLogs).reduce(
        (acc: Record<string, string>, { chapterId, lastRead }: SurahReadingLog) => ({
          ...acc,
          [chapterId]: lastRead.toString(),
        }),
        {},
      ),
    );
  }, [surahLogs]);

  const handleCheckboxOnChange = useCallback(
    (checked: boolean) => {
      if (!checked) {
        setLastVerses({});
      } else {
        const newState = {};
        Object.entries(chaptersData).forEach(([id, { versesCount }]) => {
          newState[id] = versesCount;
        });
        setLastVerses(newState);
      }
    },
    [chaptersData],
  );

  const TABS = useMemo(
    () => [
      { title: t('all'), value: 'all' },
      { title: t('selected'), value: 'selected' },
    ],
    [t],
  );

  const SURAHS = useMemo(() => {
    return Object.entries(chaptersData).map(([chapterId, { transliteratedName, versesCount }]) => {
      if (view === 'selected' && !lastVerses[chapterId]) return null;
      if (!transliteratedName.toLocaleLowerCase().includes(search.toLocaleLowerCase())) return null;
      return (
        <div className={pageStyle.chapterContainer} key={chapterId}>
          <SurahInput
            chapterId={Number(chapterId)}
            description={`${toLocalizedNumber(versesCount, lang)} ${t('common:ayahs')}`}
            surahName={transliteratedName}
            surahNumber={Number(chapterId)}
            versesCount={versesCount}
            lastVerse={lastVerses[chapterId]}
            isMinimalLayout={shouldUseMinimalLayout(lang)}
            onChangeLastVerse={(verse) => {
              if (!verse) {
                setLastVerses((state) => {
                  const newState = { ...state };
                  delete newState[chapterId];
                  return newState;
                });
              } else {
                setLastVerses((state) => ({
                  ...state,
                  [chapterId]: clamp(parseInt(verse, 10) || 1, 1, versesCount),
                }));
              }
            }}
          />
        </div>
      );
    });
  }, [chaptersData, search, view, lastVerses, t, lang]);

  useEffect(() => {
    loadPreviouslyRead();
  }, [loadPreviouslyRead]);

  useEffect(() => console.log(lastVerses), [lastVerses]);

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
              onChange={setSearch}
              onClearClicked={() => setSearch('')}
            />
          </div>
          <div className={pageStyle.flowItem}>
            <Toolbar
              numSelected={Object.keys(lastVerses).length}
              handleCheckboxOnChange={handleCheckboxOnChange}
              loadPreviouslyRead={loadPreviouslyRead}
            />
          </div>
          <div className={pageStyle.flowItem}>
            <Tabs tabs={TABS} selected={view} onSelect={setView} />
          </div>
          <div className={pageStyle.flowItem}>
            <div className={pageStyle.surahLayout}>{SURAHS}</div>
          </div>
          <div className={pageStyle.flowItem}>
            <Toolbar
              numSelected={Object.keys(lastVerses).length}
              handleCheckboxOnChange={handleCheckboxOnChange}
              loadPreviouslyRead={loadPreviouslyRead}
            />
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
