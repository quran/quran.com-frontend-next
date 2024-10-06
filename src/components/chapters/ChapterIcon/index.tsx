import React from 'react';

import classNames from 'classnames';

import styles from './ChapterIcon.module.scss';

interface Props {
  id?: string;
}

const ChapterIcon: React.FC<Props> = ({ id }) => (
  <span className={classNames(styles.icon)} translate="no">
    {id.padStart(3, '0')}
  </span>
);

export default ChapterIcon;
