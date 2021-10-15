import React from 'react';

import Link from '../dls/Link/Link';
import SurahPreviewRow from '../dls/SurahPreview/SurahPreviewRow';

import styles from './ChaptersList.module.scss';

import Chapter from 'types/Chapter';

type Props = {
  chapters: Chapter[];
};

const ChaptersList: React.FC<Props> = ({ chapters }: Props) => (
  <div className={styles.container}>
    {chapters.map((chapter) => (
      <Link href={`/${chapter.id}`}>
        <div className={styles.chapterContainer} key={chapter.id}>
          <SurahPreviewRow
            chapterId={Number(chapter.id)}
            description={`${chapter.versesCount} Ayahs`}
            surahName={chapter.nameSimple}
            surahNumber={Number(chapter.id)}
            translatedSurahName={chapter.translatedName.name}
          />
        </div>
      </Link>
    ))}
  </div>
);

export default ChaptersList;
