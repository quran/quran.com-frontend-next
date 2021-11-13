import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import styles from './ReciterSelectionBody.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import { selectReciter, setReciterAndPauseAudio } from 'src/redux/slices/AudioPlayer/state';
import { makeRecitersUrl } from 'src/utils/apiPaths';
import { RecitersResponse } from 'types/ApiResponses';
import Reciter from 'types/Reciter';

const SettingsReciter = () => {
  const { lang } = useTranslation();
  const dispatch = useDispatch();
  const selectedReciter = useSelector(selectReciter, shallowEqual);

  // given the reciterId, get the full reciter object.
  // and setReciter in redux
  const onSelectedReciterChange = (reciterId: string, reciters: Reciter[]) => {
    if (!reciterId) return;
    const reciter = reciters.find((r) => r.id === Number(reciterId));
    dispatch(setReciterAndPauseAudio({ reciter, locale: lang }));
  };

  return (
    <div>
      <DataFetcher
        queryKey={makeRecitersUrl()}
        render={(data: RecitersResponse) => {
          return (
            <div>
              {data.reciters.map((reciter) => (
                <label className={styles.reciter} htmlFor={reciter.id.toString()}>
                  <input
                    id={reciter.id.toString()}
                    type="radio"
                    name="reciter"
                    value={reciter.id}
                    checked={reciter.id === selectedReciter.id}
                    onChange={(e) => {
                      onSelectedReciterChange(e.target.value, data.reciters);
                    }}
                  />
                  <span>{reciter.name}</span>
                  <span className={styles.recitationStyle}>{reciter.style.name}</span>
                </label>
              ))}
            </div>
          );
        }}
      />
    </div>
  );
};

export default SettingsReciter;
