/* eslint-disable react/no-unknown-property */
import React, { memo } from 'react';

import classNames from 'classnames';

import styles from './Tag.module.scss';

import ComboboxSize from '@/dls/Forms/Combobox/types/ComboboxSize';
import CloseIcon from '@/icons/close.svg';

interface Props {
  onRemoveTagClicked: (event: React.MouseEvent<HTMLSpanElement>, tag: string) => void;
  size: ComboboxSize;
  tag: string;
}

const Tag: React.FC<Props> = ({ onRemoveTagClicked, size, tag }) => (
  <span
    className={classNames(styles.item, {
      [styles.largeItem]: size === ComboboxSize.Large,
    })}
  >
    <span className={styles.itemContent}>{tag}</span>
    <span
      className={styles.itemRemove}
      unselectable="on"
      aria-hidden="true"
      onClick={(event) => {
        onRemoveTagClicked(event, tag);
      }}
    >
      <span role="img" aria-label="close" className={styles.icon}>
        <CloseIcon />
      </span>
    </span>
  </span>
);

export default memo(Tag);
