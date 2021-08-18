import Bismillah from 'src/components/dls/Bismillah/Bismillah';
import React from 'react';
import PlayChapterAudioButton from 'src/components/QuranReader/PlayChapterAudioButton';
import Button from 'src/components/dls/Button/Button';
import ChapterIconContainer from '../ChapterIcon/ChapterIconContainer';
import styles from './ChapterHeader.module.scss';

interface Props {
  chapterId: string;
}

const CHAPTERS_WITHOUT_BISMILLAH = ['1', '9'];

const ChapterHeader: React.FC<Props> = ({ chapterId }) => (
  <div className={styles.container}>
    <div className={styles.item}>
      <ChapterIconContainer chapterId={chapterId} />
    </div>
    {!CHAPTERS_WITHOUT_BISMILLAH.includes(chapterId) && (
      <div className={styles.item}>
        <Bismillah />
      </div>
    )}
    <div className={styles.actionsContainer}>
      <PlayChapterAudioButton chapterId={Number(chapterId)} />
      <Button text="Info" href={`/${chapterId}/info`} />
    </div>
  </div>
);

export default ChapterHeader;
