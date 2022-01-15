import sample from 'lodash/sample';
import { useDispatch } from 'react-redux';

import Card, { CardSize } from '../dls/Card/Card';

import styles from './RandomPlaylist.module.scss';

import { fetcher } from 'src/api';
import { exitRepeatMode, playFrom } from 'src/redux/slices/AudioPlayer/state';
import { makeRecitersUrl } from 'src/utils/apiPaths';
import { getRandomChapterId } from 'src/utils/chapter';
import { RecitersResponse } from 'types/ApiResponses';

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
const getRandomReciterId = async () => {
  const recitersResponse: RecitersResponse = await fetcher(makeRecitersUrl());
  const recitersId = recitersResponse.reciters.map((reciter) => reciter.id);
  return sample(recitersId);
};

const RandomPlaylist = () => {
  const dispatch = useDispatch();

  const playRandomAudio = async () => {
    // clean up, make sure we're not in repeat mode
    dispatch(exitRepeatMode());

    // TODO: add logging

    const randomRecitersId = await getRandomReciterId();

    dispatch(
      playFrom({
        chapterId: getRandomChapterId(),
        reciterId: randomRecitersId,
        shouldUseRandomTimestamp: true,
      }),
    );
  };

  return (
    <div className={styles.container}>
      {playlists.map((playlist) => (
        <div className={styles.item}>
          <Card size={CardSize.Large} {...playlist} onClick={playRandomAudio} />
        </div>
      ))}
    </div>
  );
};

export default RandomPlaylist;
