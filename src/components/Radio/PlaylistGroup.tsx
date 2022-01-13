import PlaylistCard, { PlayListCardSize } from './PlaylistCard';
import styles from './PlaylistGroup.module.scss';

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

const PlaylistGroup = () => {
  return (
    <div className={styles.container}>
      {playlists.map((playlist) => (
        <PlaylistCard size={PlayListCardSize.Medium} {...playlist} />
      ))}
    </div>
  );
};

export default PlaylistGroup;
