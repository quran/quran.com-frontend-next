import { ReactNode, FC } from 'react';

import styles from './PageContainer.module.scss';

type Props = {
  children: ReactNode | ReactNode[];
};

const PageContainer: FC<Props> = ({ children }) => {
  return <div className={styles.container}>{children}</div>;
};

export default PageContainer;
