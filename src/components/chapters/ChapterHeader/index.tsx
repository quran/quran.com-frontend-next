import React, { useRef } from 'react';

import useTranslation from 'next-translate/useTranslation';

import InfoIcon from '../../../../public/icons/info.svg';

import styles from './ChapterHeader.module.scss';

import ChapterIconContainer, {
  ChapterIconsSize,
} from 'src/components/chapters/ChapterIcon/ChapterIconContainer';
import Bismillah, { BismillahSize } from 'src/components/dls/Bismillah/Bismillah';
import Button, { ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import { QURAN_READER_OBSERVER_ID } from 'src/components/QuranReader/observer';
import PlayChapterAudioButton from 'src/components/QuranReader/PlayChapterAudioButton';
import useIntersectionObserver from 'src/hooks/useObserveElement';
import { getChapterData } from 'src/utils/chapter';
import { getSurahInfoNavigationUrl } from 'src/utils/navigation';
import { formatChapterId } from 'src/utils/verse';

interface Props {
  chapterId: string;
  pageNumber: number;
  hizbNumber: number;
}

const CHAPTERS_WITHOUT_BISMILLAH = ['1', '9'];

const ChapterHeader: React.FC<Props> = ({ chapterId, pageNumber, hizbNumber }) => {
  const { t } = useTranslation('common');
  const headerRef = useRef(null);
  /**
   * the intersection observer is needed so that we know that the first verse
   * of the current chapter is being read when the ChapterHeader appears within
   * the intersection observer root's borders.
   */
  useIntersectionObserver(headerRef, QURAN_READER_OBSERVER_ID);
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
            {t('surah')} <br /> {nameSimple}
          </div>
          <div className={styles.infoContainer}>
            <Button
              size={ButtonSize.Small}
              variant={ButtonVariant.Ghost}
              prefix={<InfoIcon />}
              href={getSurahInfoNavigationUrl(chapterId)}
              hasSidePadding={false}
            >
              {t('quran-reader:surah-info')}
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
