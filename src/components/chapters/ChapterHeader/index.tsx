import React, { useRef, useEffect } from 'react';

import { useDispatch } from 'react-redux';

import InfoIcon from '../../../../public/icons/info.svg';
import QOutlineIcon from '../../../../public/icons/Q-outline.svg';

import styles from './ChapterHeader.module.scss';

import ChapterIconContainer, {
  ChapterIconsSize,
} from 'src/components/chapters/ChapterIcon/ChapterIconContainer';
import Bismillah, { BismillahSize } from 'src/components/dls/Bismillah/Bismillah';
import Button, { ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import PlayChapterAudioButton from 'src/components/QuranReader/PlayChapterAudioButton';
import useIntersectionObserver from 'src/hooks/useIntersectionObserver';
import { setLastReadVerse } from 'src/redux/slices/QuranReader/readingTracker';
import { getChapterData } from 'src/utils/chapter';
import { getSurahInfoNavigationUrl } from 'src/utils/navigation';
import { formatChapterId } from 'src/utils/verse';

interface Props {
  chapterId: string;
  pageNumber: number;
  hizbNumber: number;
}

const CHAPTERS_WITHOUT_BISMILLAH = ['1', '9'];
const ROOT_MARGIN = '-10% 0px -85% 0px';
const OBSERVER_THRESHOLD = 0.01;

const ChapterHeader: React.FC<Props> = ({ chapterId, pageNumber, hizbNumber }) => {
  const headerRef = useRef(null);
  const dispatch = useDispatch();
  /**
   * the intersection observer is needed so that we know that the first verse
   * of the current chapter is being read when the ChapterHeader appears within
   * the intersection observer root's borders.
   */
  const intersectionObserverEntry = useIntersectionObserver(headerRef, {
    rootMargin: ROOT_MARGIN,
    threshold: OBSERVER_THRESHOLD,
  });
  useEffect(() => {
    if (intersectionObserverEntry && intersectionObserverEntry.isIntersecting) {
      const verseTextNode = intersectionObserverEntry.target;
      dispatch({
        type: setLastReadVerse.type,
        payload: {
          verseKey: verseTextNode.getAttribute('data-verse-key'),
          chapterId: verseTextNode.getAttribute('data-chapter-id'),
          page: verseTextNode.getAttribute('data-page'),
          hizb: verseTextNode.getAttribute('data-hizb'),
        },
      });
    }
  }, [dispatch, intersectionObserverEntry]);
  const chapterData = getChapterData(chapterId);

  const translatedName = chapterData.translatedName.name;
  const { nameSimple } = chapterData;

  return (
    <div
      ref={headerRef}
      data-verse-key={`${chapterId}:1`}
      data-page={pageNumber}
      data-chapter-id={chapterId}
      data-hizb={hizbNumber}
    >
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.translatedName}>{translatedName}</div>
          <div className={styles.nameSimple}>
            Surah <br /> {nameSimple}
          </div>
          <div className={styles.infoContainer}>
            <Button
              size={ButtonSize.Small}
              variant={ButtonVariant.Ghost}
              prefix={<InfoIcon />}
              href={getSurahInfoNavigationUrl(chapterId)}
              hasSidePadding={false}
            >
              Surah Info
            </Button>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.chapterId}>{formatChapterId(chapterId)}</div>
          <div className={styles.arabicSurahNameContainer}>
            <ChapterIconContainer
              chapterId={chapterId}
              size={ChapterIconsSize.Large}
              hasSurahPrefix={false}
            />
          </div>
          <div className={styles.actionContainer}>
            <PlayChapterAudioButton chapterId={Number(chapterId)} />
          </div>
          <div className={styles.QOutlineWrapper}>
            <QOutlineIcon />
          </div>
        </div>
      </div>
      <div className={styles.bismillahContainer}>
        {!CHAPTERS_WITHOUT_BISMILLAH.includes(chapterId) && (
          <Bismillah size={BismillahSize.Large} />
        )}
      </div>
    </div>
  );
};

export default ChapterHeader;
