/* eslint-disable react/no-multi-comp */
import React, { useState, useMemo } from 'react';

import dynamic from 'next/dynamic';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import Tabs from '../dls/Tabs/Tabs';

import styles from './ChapterAndJuzList.module.scss';
import ChapterAndJuzListSkeleton from './ChapterAndJuzListSkeleton';

import CaretDownIcon from '@/icons/caret-down.svg';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';
import Chapter from 'types/Chapter';

export enum View {
  Surah = 'surah',
  Juz = 'juz',
  RevelationOrder = 'revelation_order',
}

const JuzView = dynamic(() => import('./JuzView'), {
  ssr: false,
  loading: () => <ChapterAndJuzListSkeleton />,
});

const MobilePopover = dynamic(() => import('@/dls/Popover/HoverablePopover'), {
  ssr: false,
});

const RevelationOrderView = dynamic(() => import('./RevelationOrderView'), {
  ssr: false,
  loading: () => <ChapterAndJuzListSkeleton />,
});

type ChapterAndJuzListProps = {
  chapters: Chapter[];
};

enum Sort {
  ASC = 'ascending',
  DESC = 'descending',
}

const ChapterAndJuzList: React.FC<ChapterAndJuzListProps> = ({
  chapters,
}: ChapterAndJuzListProps) => {
  const { t } = useTranslation();
  const [view, setView] = useState(View.Surah);
  const [sortBy, setSortBy] = useState(Sort.ASC);

  const onSort = () => {
    setSortBy((prevValue) => {
      const newValue = prevValue === Sort.DESC ? Sort.ASC : Sort.DESC;
      // eslint-disable-next-line i18next/no-literal-string
      logValueChange(`homepage_${view}_sorting`, prevValue, newValue);
      return newValue;
    });
  };

  const tabs = useMemo(
    () => [
      { title: t(`common:${View.Surah}`), value: View.Surah },
      { title: t(`common:${View.Juz}`), value: View.Juz, id: 'juz-tab' },
      { title: t(`common:${View.RevelationOrder}`), value: View.RevelationOrder },
    ],
    [t],
  );

  const sortedChapters = useMemo(
    () =>
      sortBy === Sort.DESC
        ? chapters.slice().sort((a, b) => Number(b.id) - Number(a.id))
        : chapters,
    [sortBy, chapters],
  );

  const onTabSelected = (newView) => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`homepage_${newView}_tab`);
    setView(newView as View);
  };

  return (
    <>
      <div className={styles.tabsContainer}>
        <Tabs tabs={tabs} selected={view} onSelect={onTabSelected} />
        <div className={styles.sorter}>
          <div className={styles.uppercase}>{t('common:sort.by')}:</div>
          <div
            className={styles.sortByValue}
            onClick={onSort}
            role="button"
            onKeyPress={onSort}
            tabIndex={0}
          >
            <span>{t(`common:sort.${sortBy}`)}</span>
            <span className={sortBy === Sort.ASC ? styles.rotate180 : ''}>
              <CaretDownIcon />
            </span>
          </div>
        </div>
        {view === View.RevelationOrder && (
          <div className={styles.revelationOrderDisclaimer}>
            <span>
              <Trans
                i18nKey="home:revelation-order-disclaimer"
                components={{
                  link: (
                    // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
                    <a
                      href="https://tanzil.net/docs/revelation_order"
                      target="_blank"
                      rel="noreferrer"
                    />
                  ),
                  // @ts-ignore
                  hover: <MobilePopover isContainerSpan content={t('common:pbuh')} />,
                }}
              />
            </span>
          </div>
        )}
      </div>
      {view === View.Surah && <SurahView sortedChapters={sortedChapters} />}
      {view === View.Juz && <JuzView isDescending={sortBy === Sort.DESC} />}
      {view === View.RevelationOrder && (
        <RevelationOrderView isDescending={sortBy === Sort.DESC} chapters={chapters} />
      )}
    </>
  );
};

export default ChapterAndJuzList;
