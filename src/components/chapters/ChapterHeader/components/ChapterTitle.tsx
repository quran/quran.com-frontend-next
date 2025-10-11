import React from 'react';

import classNames from 'classnames';

import styles from '../ChapterHeader.module.scss';

import ChapterIcon from './ChapterIcon';
import SurahInfoButton from './SurahInfoButton';

import { ChapterIconsSize } from '@/components/chapters/ChapterIcon/ChapterIconContainer';
import useIsMobile from '@/hooks/useIsMobile';
import { Direction } from '@/utils/locale';

interface ChapterTitleProps {
  chapterId: string;
  transliteratedName: string;
  translatedName: string;
  showTranslatedName: boolean;
}

/**
 * ChapterTitle component displays the chapter title, number, and names
 * @param {ChapterTitleProps} props - Component props
 * @returns {JSX.Element} The ChapterTitle component
 */
const ChapterTitle: React.FC<ChapterTitleProps> = ({
  chapterId,
  transliteratedName,
  translatedName,
  showTranslatedName,
}) => {
  const isMobile = useIsMobile();

  return (
    <div dir={Direction.RTL} className={styles.titleContainer}>
      <h1
        data-testid="chapter-title"
        className={classNames(styles.chapterTitle, {
          [styles.chapterTitleWithTranslationName]: showTranslatedName,
        })}
      >
        {showTranslatedName && (
          <div className={styles.titleTextContainer}>
            <div className={styles.titleRow}>
              <SurahInfoButton chapterId={chapterId} />
              <p className={styles.transliteratedName}>{transliteratedName}</p>
              <p className={styles.chapterNumber}>.{chapterId}</p>
            </div>
            <p className={styles.translatedName}>{translatedName}</p>
          </div>
        )}

        {!showTranslatedName && (
          <SurahInfoButton chapterId={chapterId} className={styles.infoIconButtonWithSurahName} />
        )}

        <div className={styles.arabicSurahNameContainer}>
          <ChapterIcon
            chapterId={chapterId}
            size={isMobile ? ChapterIconsSize.XMega : ChapterIconsSize.Massive}
          />
        </div>
      </h1>
    </div>
  );
};

export default ChapterTitle;
