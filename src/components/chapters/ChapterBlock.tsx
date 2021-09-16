import React from 'react';

import classNames from 'classnames';
import Link from 'next/link';

import styles from './ChapterBlock.module.scss';
import ChapterIconContainer from './ChapterIcon/ChapterIconContainer';

import Chapter from 'types/Chapter';

type Props = {
  chapter: Chapter;
};

const ChapterBlock: React.FC<Props> = ({ chapter }: Props) => (
  <div key={chapter.id} className={styles.item}>
    <Link as={`/${chapter.id}`} href="/[chapterId]" passHref>
      <a className={styles.link}>
        <div className={styles.container}>
          <div className={classNames(styles.leftContainer, styles.sectionContainer)}>
            <p className={styles.number}>{chapter.id}</p>
            <div className={styles.detailsContainer}>
              <div className={styles.nameArabic}>{chapter.nameSimple}</div>
              <div className={styles.nameTranslated}>{chapter.translatedName.name}</div>
            </div>
          </div>
          <div className={classNames(styles.detailsContainer, styles.sectionContainer)}>
            <ChapterIconContainer chapterId={String(chapter.id)} />
            <p className={styles.numberOfVerses}>{chapter.versesCount} ayahs</p>
          </div>
        </div>
      </a>
    </Link>
  </div>
);

export default ChapterBlock;
