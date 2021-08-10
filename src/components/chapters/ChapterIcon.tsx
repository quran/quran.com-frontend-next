import React from 'react';
import styles from './ChapterIcon.module.scss';

interface Props {
  id?: string;
}

const ChapterIcon: React.FC<Props> = ({ id }) => (
  <span className={styles[`icon${id ? `-${id}` : ''}`]} />
);

export default ChapterIcon;
