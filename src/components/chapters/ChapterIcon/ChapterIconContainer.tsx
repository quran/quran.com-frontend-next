import React from 'react';

import classNames from 'classnames';

import styles from './ChapterIconContainer.module.scss';

import ChapterIcon from '@/components/chapters/ChapterIcon';

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

const IconContainer: React.FC<Props> = ({
  chapterId,
  size = ChapterIconsSize.Medium,
  hasSurahPrefix = true,
}) => (
  <span
    className={classNames(styles.iconContainer, {
      [styles.iconContainerSmall]: size === ChapterIconsSize.Small,
      [styles.iconContainerLarge]: size === ChapterIconsSize.Large,
      [styles.iconContainerMega]: size === ChapterIconsSize.Mega,
    })}
  >
    <ChapterIcon id={chapterId} />
    {hasSurahPrefix && <ChapterIcon id="surah" />}
  </span>
);

export default IconContainer;
