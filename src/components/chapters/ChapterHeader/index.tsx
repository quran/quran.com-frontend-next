import React from 'react';
import Button, { ButtonVariant, ButtonSize } from 'src/components/dls/Button/Button';
import Bismillah, { BismillahSize } from 'src/components/dls/Bismillah/Bismillah';
import ChapterIconContainer, { ChapterIconsSize } from '../ChapterIcon/ChapterIconContainer';
import styles from './ChapterHeader.module.scss';
import PlayIcon from '../../../../public/icons/play-arrow.svg';
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
        <div>{translatedChapterName}</div>
        <div>Surah {chapterName}</div>
        <Button variant={ButtonVariant.Ghost} href={`/${chapterId}/info`}>
          Info
        </Button>
      </div>
      <div className={styles.right}>
        <div className={styles.QOutlineWrapper}>
          <QOutlineIcon />
        </div>
        <div className={styles.chapterId}>{formatChapterId(chapterId)}</div>
        <div style={{ textAlign: 'right' }}>
          <ChapterIconContainer chapterId={chapterId} size={ChapterIconsSize.Large} />
        </div>
        <Button size={ButtonSize.Small} variant={ButtonVariant.Ghost} prefix={<PlayIcon />}>
          Play Audio
        </Button>
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
