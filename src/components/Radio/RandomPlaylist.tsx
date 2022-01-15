import Card, { CardSize } from '../dls/Card/Card';

import styles from './RandomPlaylist.module.scss';

const playlists = [
  {
    title: 'Ar-Rahman, Ya-seen, Al-Waqi’ah',
    description: 'Mishary Al-fasy',
  },
  {
    title: 'Ar-Rahman, Ya-seen, Al-Waqi’ah',
    description: 'Mishary Al-fasy',
  },
  {
    title: 'Ar-Rahman, Ya-seen, Al-Waqi’ah',
    description: 'Mishary Al-fasy',
  },
];

const RandomPlaylist = () => {
  return (
    <div className={styles.container}>
      {playlists.map((playlist) => (
        <div className={styles.item}>
          <Card size={CardSize.Large} {...playlist} />
        </div>
      ))}
    </div>
  );
};

export default RandomPlaylist;
