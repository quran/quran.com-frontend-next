/* eslint-disable i18next/no-literal-string */
import classNames from 'classnames';

import styles from './index.module.scss';

import PlaylistGroup from 'src/components/Radio/PlaylistGroup';
import RandomPlaylist from 'src/components/Radio/RandomPlaylist';

const Radio = () => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.flow}>
        <div className={classNames(styles.flowItem)}>Listen Now</div>
        <div className={classNames(styles.flowItem, styles.fullWidth)}>
          <RandomPlaylist />
        </div>
        <div className={classNames(styles.flowItem)}>Popular Playlist</div>
        <div className={classNames(styles.flowItem, styles.fullWidth)}>
          <PlaylistGroup />
        </div>
        <div className={classNames(styles.flowItem)}>Classic Playlist</div>
        <div className={classNames(styles.flowItem, styles.fullWidth)}>
          <PlaylistGroup />
        </div>
      </div>
    </div>
  );
};

export default Radio;
