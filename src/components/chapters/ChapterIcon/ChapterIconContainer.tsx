import React from 'react';

import classNames from 'classnames';

import styles from './ChapterIconContainer.module.scss';

import { SurahName } from '@/components/SurahName';

export enum ChapterIconsSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  Mega = 'mega',
  XMega = 'xmega',
  Massive = 'massive',
}

interface Props {
  chapterId: string;
  size?: ChapterIconsSize;
}

const IconContainer: React.FC<Props> = ({ chapterId, size = ChapterIconsSize.Medium }) => (
  <span
    className={classNames(styles.iconContainer, {
      [styles.iconContainerSmall]: size === ChapterIconsSize.Small,
      [styles.iconContainerLarge]: size === ChapterIconsSize.Large,
      [styles.iconContainerMega]: size === ChapterIconsSize.Mega,
      [styles.iconContainerXMega]: size === ChapterIconsSize.XMega,
      [styles.iconContainerMassive]: size === ChapterIconsSize.Massive,
    })}
  >
    <SurahName chapterId={Number(chapterId)} />
  </span>
);

export default IconContainer;
