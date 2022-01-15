/* eslint-disable i18next/no-literal-string */
import classNames from 'classnames';

import styles from './index.module.scss';

import RandomPlaylist from 'src/components/Radio/RandomPlaylist';
import ReciterList from 'src/components/Radio/ReciterList';

const Radio = () => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.flow}>
        <div className={classNames(styles.flowItem)}>Listen Now</div>
        <div className={classNames(styles.flowItem, styles.fullWidth)}>
          <RandomPlaylist />
        </div>
        <div className={classNames(styles.flowItem)}>All Reciters</div>
        <div className={classNames(styles.flowItem, styles.fullWidth)}>
          <ReciterList />
        </div>
      </div>
    </div>
  );
};

export default Radio;
