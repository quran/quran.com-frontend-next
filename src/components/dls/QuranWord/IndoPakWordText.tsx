import React from 'react';
import styles from './IndoPakWordText.module.scss';

type IndoPakWordTextProps = {
  text: string;
};

const IndoPakWordText: React.FC<IndoPakWordTextProps> = ({ text }) => {
  return <span className={styles.text}>{text}</span>;
};

export default IndoPakWordText;
