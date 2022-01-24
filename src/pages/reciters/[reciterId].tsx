/* eslint-disable max-lines */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable i18next/no-literal-string */

import { useState, useMemo } from 'react';

import classNames from 'classnames';
import clipboardCopy from 'clipboard-copy';
import Fuse from 'fuse.js';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import useSWR from 'swr';

import OverflowMenuIcon from '../../../public/icons/menu_more_horiz.svg';
import PlayIcon from '../../../public/icons/play-arrow.svg';
import SearchIcon from '../../../public/icons/search.svg';
import ShareIcon from '../../../public/icons/share.svg';
import layoutStyle from '../index.module.scss';

import pageStyle from './reciterPage.module.scss';

import { getAvailableReciters } from 'src/api';
import ChapterIconContainer from 'src/components/chapters/ChapterIcon/ChapterIconContainer';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import Footer from 'src/components/dls/Footer/Footer';
import Input from 'src/components/dls/Forms/Input';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { ToastStatus, useToast } from 'src/components/dls/Toast/Toast';
import { reciterPictures } from 'src/components/Radio/ReciterStationList';
import { StationState, StationType } from 'src/components/Radio/types';
import { playFrom } from 'src/redux/slices/AudioPlayer/state';
import { setRadioStationState } from 'src/redux/slices/radio';
import { makeRecitersUrl } from 'src/utils/apiPaths';
import { getAllChaptersData, getRandomChapterId } from 'src/utils/chapter';
import { logEmptySearchResults, logEvent } from 'src/utils/eventLogger';
import { getWindowOrigin } from 'src/utils/url';
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
  const { t, lang } = useTranslation('common');

  const reciterId = router.query.reciterId as string;

  const reciters = useSWR(makeRecitersUrl(lang), async () => {
    return getAvailableReciters(lang);
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
      reciterId,
    };
    dispatch(setRadioStationState(nextStationState));

    dispatch(
      playFrom({
        chapterId: Number(selectedChapterId),
        reciterId: Number(reciterId),
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

  const toast = useToast();

  return (
    <div className={classNames(layoutStyle.pageContainer)}>
      <div className={classNames(layoutStyle.flowItem, pageStyle.headerContainer)}>
        <div className={pageStyle.reciterContainer}>
          <div className={pageStyle.reciterImageContainer}>
            <img
              className={pageStyle.reciterImage}
              src={reciterPictures[reciterId]}
              alt={selectedReciter?.name}
            />
          </div>
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
          prefix={<SearchIcon />}
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
              onClick={() => {
                onPlayClick(chapter.id.toString());
              }}
            >
              <div className={pageStyle.chapterInfoContainer}>
                <div className={pageStyle.chapterId}>{chapter.id}</div>
                <div>
                  <div className={pageStyle.chapterName}>{chapter.transliteratedName}</div>
                  <span className={pageStyle.chapterIconContainer}>
                    <ChapterIconContainer
                      chapterId={chapter.id.toString()}
                      hasSurahPrefix={false}
                    />
                  </span>
                </div>
              </div>
              <div className={pageStyle.actionsContainer}>
                <Button variant={ButtonVariant.Ghost} size={ButtonSize.Small}>
                  <PlayIcon />
                </Button>
                <PopoverMenu
                  trigger={
                    <Button
                      size={ButtonSize.Small}
                      tooltip={t('more')}
                      variant={ButtonVariant.Ghost}
                      shape={ButtonShape.Circle}
                    >
                      <OverflowMenuIcon />
                    </Button>
                  }
                >
                  <PopoverMenu.Item
                    shouldStopPropagation
                    onClick={() => {
                      const origin = getWindowOrigin();
                      clipboardCopy(`${origin}/${chapter.id}`).then(() => {
                        toast(t('shared'), { status: ToastStatus.Success });
                      });
                    }}
                    icon={<ShareIcon />}
                  >
                    {t('share')}
                  </PopoverMenu.Item>
                </PopoverMenu>
              </div>
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
