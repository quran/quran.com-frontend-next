/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable i18next/no-literal-string */

import { useState, useMemo } from 'react';

import classNames from 'classnames';
import Fuse from 'fuse.js';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import useSWR from 'swr';

import PlayIcon from '../../../public/icons/play-arrow.svg';
import IconSearch from '../../../public/icons/search.svg';
import layoutStyle from '../index.module.scss';

import pageStyle from './reciterPage.module.scss';

import { getAvailableReciters } from 'src/api';
import ChapterIconContainer from 'src/components/chapters/ChapterIcon/ChapterIconContainer';
import Button, { ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import Footer from 'src/components/dls/Footer/Footer';
import Input from 'src/components/dls/Forms/Input';
import { StationState, StationType } from 'src/components/Radio/types';
import { playFrom } from 'src/redux/slices/AudioPlayer/state';
import { setRadioStationState } from 'src/redux/slices/radio';
import { makeRecitersUrl } from 'src/utils/apiPaths';
import { getAllChaptersData, getRandomChapterId } from 'src/utils/chapter';
import { logEmptySearchResults, logEvent } from 'src/utils/eventLogger';
import Chapter from 'types/Chapter';

const filterChapters = (chapters, searchQuery: string) => {
  const fuse = new Fuse(chapters, {
    keys: ['transliteratedName'],
    threshold: 0.3,
  });

  const filteredReciter = fuse.search(searchQuery);
  const resultItems = filteredReciter.map(({ item }) => item);
  if (!filteredReciter.length) {
    logEmptySearchResults(searchQuery, 'reciter_page_chapter_list');
  }
  return resultItems as (Chapter & { id: number })[];
};

const Reciterpage = () => {
  const allChapterData = getAllChaptersData();
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation('common');

  const reciters = useSWR(makeRecitersUrl(), async () => {
    return getAvailableReciters();
  });

  const selectedReciter = reciters.data?.reciters.find(
    (reciter) => reciter.id.toString() === router.query.reciterId,
  );

  const onPlayClick = (chapterId?: string) => {
    const selectedChapterId = chapterId || getRandomChapterId().toString();

    logEvent('reciter_page_played', {
      stationId: selectedChapterId,
    });

    const nextStationState: StationState = {
      id: router.query.reciterId as string,
      type: StationType.Reciter,
      title: selectedReciter?.name,
      description: selectedReciter?.style.name,
      chapterId: selectedChapterId,
      reciterId: router.query.reciterId as string,
    };
    dispatch(setRadioStationState(nextStationState));

    dispatch(
      playFrom({
        chapterId: Number(selectedChapterId),
        reciterId: Number(router.query.reciterId),
        timestamp: 0,
        isRadioMode: true,
      }),
    );
  };

  const [searchQuery, setSearchQuery] = useState('');

  const allChaptersWithId = useMemo(
    () =>
      Object.entries(allChapterData).map(([chapterId, chapter]) => ({
        id: chapterId,
        ...chapter,
      })),
    [allChapterData],
  );

  const filteredChapters = useMemo(
    () => (searchQuery ? filterChapters(allChaptersWithId, searchQuery) : allChaptersWithId),
    [searchQuery, allChaptersWithId],
  );

  return (
    <div className={classNames(layoutStyle.pageContainer)}>
      <div className={classNames(layoutStyle.flowItem, pageStyle.headerContainer)}>
        <div className={pageStyle.reciterContainer}>
          <div className={pageStyle.reciterImage} />
          <div>
            <div className={pageStyle.reciterName}>{selectedReciter?.name}</div>
            <Button prefix={<PlayIcon />} onClick={() => onPlayClick()}>
              Play Audio
            </Button>
          </div>
        </div>
      </div>

      <div className={classNames(layoutStyle.flowItem, pageStyle.searchContainer)}>
        <Input
          prefix={<IconSearch />}
          id="translations-search"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('settings.search-reciter')}
          fixedWidth={false}
        />
      </div>

      <div className={classNames(layoutStyle.flowItem)}>
        <div className={pageStyle.surahListContainer}>
          {filteredChapters.map((chapter) => (
            <div
              key={chapter.id}
              className={pageStyle.chapterListItem}
              onClick={() => onPlayClick(chapter.id.toString())}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <div className={pageStyle.chapterId}>{chapter.id}</div>
                <div>
                  <div className={pageStyle.chapterName}>{chapter.transliteratedName}</div>
                  <ChapterIconContainer chapterId={chapter.id.toString()} hasSurahPrefix={false} />
                </div>
              </span>
              <Button variant={ButtonVariant.Ghost} size={ButtonSize.Small}>
                <PlayIcon />
              </Button>
            </div>
          ))}
          <div />
        </div>
      </div>

      <div className={classNames(layoutStyle.flowItem, pageStyle.footerContainer)}>
        <Footer />
      </div>
    </div>
  );
};

export default Reciterpage;
