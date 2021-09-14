import React from 'react';
import { useDispatch, shallowEqual, useSelector } from 'react-redux';
import { getAvailableReciters } from 'src/api';
import { selectReciter, setReciter } from 'src/redux/slices/AudioPlayer/state';
import { makeRecitersUrl } from 'src/utils/apiPaths';
import useSWRImmutable from 'swr/immutable';
import Reciter from 'types/Reciter';
import styles from './ReciterAdjustment.module.scss';

const ReciterAdjustment: React.FC = () => {
  const dispatch = useDispatch();
  const { data, error } = useSWRImmutable(makeRecitersUrl(), () =>
    getAvailableReciters().then((res) =>
      res.status === 500 ? Promise.reject(error) : Promise.resolve(res.reciters),
    ),
  );
  const selectedReciter = useSelector(selectReciter, shallowEqual);
  const reciters = data || [];

  const onSelectedReciterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const reciter = reciters.find((r) => r.id === Number(e.target.value));
    dispatch(setReciter(reciter));
  };

  if (error) return null;

  return (
    <label htmlFor="reciters">
      Select Reciters{' '}
      <select
        name="reciters"
        onChange={onSelectedReciterChange}
        className={styles.select}
        value={selectedReciter.id}
      >
        {(reciters as Reciter[]).map((reciter) => (
          <option key={reciter.id} value={reciter.id}>
            {reciter.name}
          </option>
        ))}
      </select>
    </label>
  );
};

export default ReciterAdjustment;
