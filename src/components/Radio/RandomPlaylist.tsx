import PlaylistCard, { PlayListCardSize } from './PlaylistCard';
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
        <PlaylistCard size={PlayListCardSize.Large} {...playlist} />
      ))}
    </div>
  );
};

export default RandomPlaylist;
