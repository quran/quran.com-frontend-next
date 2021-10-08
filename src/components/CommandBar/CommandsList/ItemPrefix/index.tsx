import React from 'react';

import NavigateIcon from '../../../../../public/icons/east.svg';

import styles from './ItemPrefix.module.scss';

interface Props {
  name: string;
}

const ItemPrefix: React.FC<Props> = ({ name }) => {
  return (
    <div className={styles.commandItemBody}>
      <span className={styles.commandPrefix}>
        <NavigateIcon />
      </span>
      {name}
    </div>
  );
};

export default ItemPrefix;
