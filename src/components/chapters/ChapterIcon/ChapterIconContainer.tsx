import React, { useContext } from 'react';

import classNames from 'classnames';

import styles from './ChapterIconContainer.module.scss';

import DataContext from 'src/contexts/DataContext';
import { getChapterData } from 'src/utils/chapter';

export enum ChapterIconsSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  Mega = 'mega',
}

// TODO: maybe replace `hasSurahPrefix` with `variant` and use it to show v1 or v2 surah name font
interface Props {
  chapterId: string;
  size?: ChapterIconsSize;
  hasSurahPrefix?: boolean;
}

const IconContainer: React.FC<Props> = ({ chapterId, size = ChapterIconsSize.Medium }) => {
  const chaptersData = useContext(DataContext);
  const chapterData = getChapterData(chaptersData, chapterId);
  return (
    <span
      className={classNames(styles.iconContainer, {
        [styles.iconContainerSmall]: size === ChapterIconsSize.Small,
        [styles.iconContainerLarge]: size === ChapterIconsSize.Large,
        [styles.iconContainerMega]: size === ChapterIconsSize.Mega,
      })}
    >
      <span className={styles.nameArabic}>{chapterData.nameArabic}</span>
    </span>
  );
};

export default IconContainer;
