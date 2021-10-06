import React from 'react';

import styles from './Header.module.scss';

interface Props {
  text: string;
}

const index: React.FC<Props> = ({ text }) => <p className={styles.header}>{text}</p>;

export default index;
