import React from 'react';

import classNames from 'classnames';

import styles from './ChapterIconContainer.module.scss';

import ChapterIcon from 'src/components/chapters/ChapterIcon';

export enum ChapterIconsSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

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
    })}
  >
    <ChapterIcon id={chapterId} />
    {hasSurahPrefix && <ChapterIcon />}
  </span>
);

export default IconContainer;
