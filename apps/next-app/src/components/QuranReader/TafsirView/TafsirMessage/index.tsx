import React from 'react';

import styles from './TafsirMessage.module.scss';

type Props = {
  children: React.ReactNode;
};

const TafsirMessage: React.FC<Props> = ({ children }) => {
  return <div className={styles.tafsirMessage}>{children}</div>;
};

export default TafsirMessage;
