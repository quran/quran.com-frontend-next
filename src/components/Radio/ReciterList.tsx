import { useDispatch } from 'react-redux';

import PlayIcon from '../../../public/icons/play-arrow.svg';
import DataFetcher from '../DataFetcher';
import Card, { CardSize } from '../dls/Card/Card';

import styles from './ReciterList.module.scss';
import { StationState, StationType } from './types';

import { playFrom } from 'src/redux/slices/AudioPlayer/state';
import { setRadioStationState } from 'src/redux/slices/radioStation';
import { makeRecitersUrl } from 'src/utils/apiPaths';
import { getRandomChapterId } from 'src/utils/chapter';
import { RecitersResponse } from 'types/ApiResponses';
import Reciter from 'types/Reciter';

// temporary image placeholders
// TODO: put image to our cdn or to nextjs repo
const reciterPictures = {
  1: 'https://i1.sndcdn.com/artworks-000122149420-zga781-t500x500.jpg',
  2: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuRRC5r1qZ2PQjsLTBa8nOx2bmpND0W6PLdw&usqp=CAU',
  3: 'https://cdn-2.tstatic.net/makassar/foto/bank/images/asy-syaikh-abdurrahman-bin-abdul-aziz-bin-muhammad-as-sudais_20160516_171230.jpg',
  4: 'https://direct.rhapsody.com/imageserver/images/alb.387527634/500x500.jpg',
  5: 'https://2.bp.blogspot.com/-A9WEncyfIm4/WNTIQgek3AI/AAAAAAAACdQ/ujgki4rZcAIDzOBmU7D3dhUlfhdDgwq3QCLcB/s1600/2.jpg',
  6: 'https://lastfm.freetls.fastly.net/i/u/770x0/d26da0675d814f679aed4d710c90fe08.jpg',
  7: 'http://en.quran.com.kw/wp-content/uploads/Mishary.jpg',
  10: 'https://i1.sndcdn.com/artworks-000146109659-eg6g92-t500x500.jpg',
  9: 'http://quran.com.kw/en/wp-content/uploads/al-minshawy-1-300x300.jpg',
  161: 'http://en.quran.com.kw/wp-content/uploads/khalifa-al-Tinijy.jpg',
  12: 'https://i1.sndcdn.com/artworks-000531171024-mmfwnq-t500x500.jpg',
};

const ReciterList = () => {
  const dispatch = useDispatch();

  const playReciterStation = async (reciter: Reciter) => {
    const stationState: StationState = {
      id: reciter.id.toString(),
      type: StationType.Reciter,
      title: reciter.name,
      description: reciter.style.name,
      chapterId: getRandomChapterId().toString(),
      reciterId: reciter.id.toString(),
    };
    dispatch(setRadioStationState(stationState));

    dispatch(
      playFrom({
        chapterId: Number(stationState.chapterId),
        reciterId: Number(stationState.reciterId),
        timestamp: 0,
        isRadioMode: true,
      }),
    );
  };

  return (
    <DataFetcher
      queryKey={makeRecitersUrl()}
      render={(data: RecitersResponse) => {
        if (!data) return null;
        return (
          <div className={styles.container}>
            {data.reciters.map((reciter) => (
              <Card
                hoverIcon={<PlayIcon />}
                imgSrc={reciterPictures[reciter.id]}
                key={reciter.id}
                onClick={() => playReciterStation(reciter)}
                title={`${reciter.id} ${reciter.name}`}
                description={reciter.style.name}
                size={CardSize.Medium}
              />
            ))}
          </div>
        );
      }}
    />
  );
};

export default ReciterList;
