import React from 'react';
import Button, { ButtonVariant } from 'src/components/dls/Button/Button';
import Bismillah, { BismillahSize } from 'src/components/dls/Bismillah/Bismillah';
import PlayChapterAudioButton from 'src/components/QuranReader/PlayChapterAudioButton';
import ChapterIconContainer, { ChapterIconsSize } from '../ChapterIcon/ChapterIconContainer';
import styles from './ChapterHeader.module.scss';
import QOutlineIcon from '../../../../public/icons/Q-outline.svg';

interface Props {
  chapterId: string;
  chapterName?: string;
  translatedChapterName?: string;
}

const CHAPTERS_WITHOUT_BISMILLAH = ['1', '9'];

const ChapterHeader: React.FC<Props> = ({
  chapterId,
  chapterName = 'Al-Fatihah',
  translatedChapterName = 'The Opener',
}) => (
  <div>
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.translatedChapterName}>{translatedChapterName}</div>
        <div className={styles.chapterName}>
          Surah <br /> {chapterName}
        </div>
        <Button variant={ButtonVariant.Ghost} href={`/${chapterId}/info`}>
          Surah Info
        </Button>
      </div>
      <div className={styles.right}>
        <div className={styles.QOutlineWrapper}>
          <QOutlineIcon />
        </div>
        <div className={styles.chapterId}>{formatChapterId(chapterId)}</div>
        <ChapterIconContainer chapterId={chapterId} size={ChapterIconsSize.Large} />
        <div className={styles.actionContainer}>
          <PlayChapterAudioButton chapterId={Number(chapterId)} />
        </div>
      </div>
    </div>
    <div className={styles.bismillahContainer}>
      {!CHAPTERS_WITHOUT_BISMILLAH.includes(chapterId) && <Bismillah size={BismillahSize.Large} />}
    </div>
  </div>
);

export default ChapterHeader;

/**
 * Format chapter id, add prefix '0' if it's a single digit number
 *
 * @param id chapter id
 * @returns formatted chapter id
 *
 * @example
 * // returns '01'
 * formatChapterId('1')
 * @example
 * // returns '102'
 * formatChapterId('102')
 */
const formatChapterId = (id: string) => `0${id}`.slice(-2);
