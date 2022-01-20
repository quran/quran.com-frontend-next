/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable i18next/no-literal-string */

import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import useSWR from 'swr';

import PlayIcon from '../../../public/icons/play-arrow.svg';
import layoutStyle from '../index.module.scss';

import pageStyle from './reciterPage.module.scss';

import { getAvailableReciters } from 'src/api';
import Button from 'src/components/dls/Button/Button';
import Footer from 'src/components/dls/Footer/Footer';
import { StationState, StationType } from 'src/components/Radio/types';
import { playFrom } from 'src/redux/slices/AudioPlayer/state';
import { setRadioStationState } from 'src/redux/slices/radio';
import { makeRecitersUrl } from 'src/utils/apiPaths';
import { getAllChaptersData, getRandomChapterId } from 'src/utils/chapter';
import { logEvent } from 'src/utils/eventLogger';

const Reciterpage = () => {
  const allChapterData = getAllChaptersData();
  const dispatch = useDispatch();
  const router = useRouter();

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

  return (
    <div className={classNames(layoutStyle.pageContainer)}>
      <div className={pageStyle.reciterImage} />

      <div className={classNames(layoutStyle.flowItem, pageStyle.headerContainer)}>
        <div className={pageStyle.reciterName}>{selectedReciter?.name}</div>
        <Button onClick={() => onPlayClick()}>
          <PlayIcon />
        </Button>
      </div>

      <div className={classNames(layoutStyle.flowItem)}>
        <div className={pageStyle.sectionTitle}>Surah List</div>
        <div className={pageStyle.surahListContainer}>
          {Object.entries(allChapterData).map(([chapterId, chapterData]) => (
            <div
              key={chapterId}
              className={pageStyle.chapterListItem}
              onClick={() => onPlayClick(chapterId)}
            >
              <div className={pageStyle.chapterId}>{chapterId}</div>
              <div className={pageStyle.chapterName}>{chapterData.transliteratedName}</div>
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
