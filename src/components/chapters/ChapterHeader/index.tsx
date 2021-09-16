import React from 'react';

import InfoIcon from '../../../../public/icons/info.svg';
import QOutlineIcon from '../../../../public/icons/Q-outline.svg';
import ChapterIconContainer, { ChapterIconsSize } from '../ChapterIcon/ChapterIconContainer';

import styles from './ChapterHeader.module.scss';

import Bismillah, { BismillahSize } from 'src/components/dls/Bismillah/Bismillah';
import Button, { ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import PlayChapterAudioButton from 'src/components/QuranReader/PlayChapterAudioButton';
import { getChapterData } from 'src/utils/chapter';
import { formatChapterId, getChapterInfoUrl } from 'src/utils/verse';

interface Props {
  chapterId: string;
}

const CHAPTERS_WITHOUT_BISMILLAH = ['1', '9'];

const ChapterHeader: React.FC<Props> = ({ chapterId }) => {
  const chapterData = getChapterData(chapterId);

  const translatedName = chapterData.translatedName.name;
  const { nameSimple } = chapterData;

  return (
    <div>
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
              href={getChapterInfoUrl(chapterId)}
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
