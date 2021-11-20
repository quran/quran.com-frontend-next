import React from 'react';

import NavigateIcon from '../../../../../public/icons/east.svg';

import styles from './CommandPrefix.module.scss';

interface Props {
  name: string;
}

const CommandPrefix: React.FC<Props> = ({ name }) => {
  return (
    <div className={styles.container}>
      <span className={styles.commandPrefix}>
        <NavigateIcon />
      </span>
      <p className={styles.name}>{name}</p>
    </div>
  );
};

export default CommandPrefix;
