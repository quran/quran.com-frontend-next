import Bismillah from 'src/components/dls/Bismillah/Bismillah';
import React from 'react';
import PlayChapterAudioButton from 'src/components/QuranReader/PlayChapterAudioButton';
import ChapterIconContainer from '../ChapterIcon/ChapterIconContainer';
import styles from './ChapterHeader.module.scss';

interface Props {
  chapterId: string;
}

const ChapterHeader: React.FC<Props> = ({ chapterId }) => (
  <div className={styles.container}>
    <div className={styles.item}>
      <ChapterIconContainer chapterId={chapterId} />
    </div>
    <div className={styles.item}>
      <Bismillah />
    </div>
    <PlayChapterAudioButton chapterId={Number(chapterId)} />
  </div>
);

export default ChapterHeader;
