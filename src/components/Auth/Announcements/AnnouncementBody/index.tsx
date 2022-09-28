import React from 'react';

import styles from './AnnouncementBody.module.scss';

type Props = {
  children: React.ReactNode;
};

const AnnouncementBody: React.FC<Props> = ({ children }) => {
  return <div className={styles.container}>{children}</div>;
};

export default AnnouncementBody;
