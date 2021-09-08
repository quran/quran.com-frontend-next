import classNames from 'classnames';
import React from 'react';
import ChapterIcon from 'src/components/chapters/ChapterIcon';
import styles from './ChapterIconContainer.module.scss';

export enum ChapterIconsSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

interface Props {
  chapterId: string;
  size?: ChapterIconsSize;
  withSurahPrefix?: boolean;
}

const IconContainer: React.FC<Props> = ({
  chapterId,
  size = ChapterIconsSize.Medium,
  withSurahPrefix = true,
}) => (
  <span
    className={classNames(styles.iconContainer, {
      [styles.iconContainerSmall]: size === ChapterIconsSize.Small,
      [styles.iconContainerLarge]: size === ChapterIconsSize.Large,
    })}
  >
    <ChapterIcon id={chapterId} />
    {withSurahPrefix && <ChapterIcon />}
  </span>
);

export default IconContainer;
