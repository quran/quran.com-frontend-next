import Card, { CardSize } from '../dls/Card/Card';

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
        <Card size={CardSize.Medium} {...playlist} />
      ))}
    </div>
  );
};

export default PlaylistGroup;
