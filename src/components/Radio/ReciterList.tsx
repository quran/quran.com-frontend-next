import { useDispatch } from 'react-redux';

import DataFetcher from '../DataFetcher';
import Card, { CardSize } from '../dls/Card/Card';

import styles from './ReciterList.module.scss';

import { exitRepeatMode, playFrom } from 'src/redux/slices/AudioPlayer/state';
import { makeRecitersUrl } from 'src/utils/apiPaths';
import { getChapterNumberFromKey, getRandomVerseKey } from 'src/utils/verse';
import { RecitersResponse } from 'types/ApiResponses';

const ReciterList = () => {
  const dispatch = useDispatch();

  const playRandomVerseFromSelectedReciter = async (reciterId: number) => {
    // clean up, make sure we're not in repeat mode
    const randomVerseKey = await getRandomVerseKey();

    dispatch(exitRepeatMode());

    dispatch(
      playFrom({
        chapterId: getChapterNumberFromKey(randomVerseKey),
        reciterId,
        verseKey: randomVerseKey,
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
                key={reciter.id}
                onClick={() => {
                  console.log(reciter);
                  playRandomVerseFromSelectedReciter(reciter.id);
                }}
                title={reciter.name}
                description={`${reciter.qirat.name} - ${reciter.style.name}`}
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
