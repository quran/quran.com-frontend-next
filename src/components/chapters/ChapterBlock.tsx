import React from 'react';
import Link from 'next/link';
import Chapter from 'types/Chapter';
import ChapterIcon from './ChapterIcon';
import styles from './ChapterBlock.module.scss';

type Props = {
  chapter: Chapter;
};

const ChapterBlock: React.FC<Props> = ({ chapter }: Props) => (
  <li key={chapter.id} className={styles.item}>
    <Link as={`/${chapter.id}`} href="/[chapterId]" passHref>
      <a className={styles.link}>
        <div className={styles.container}>
          <p className={styles.number}>{chapter.id}</p>
          <div className={styles.nameContainer}>
            <div className={styles.nameArabic}>{chapter.nameSimple}</div>
            <div className={styles.nameTranslated}>{chapter.translatedName.name}</div>
          </div>
          <span className={styles.iconContainer}>
            <ChapterIcon id={String(chapter.id)} />
            <ChapterIcon />
          </span>
        </div>
      </a>
    </Link>
  </li>
);

export default ChapterBlock;
