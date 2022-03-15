/* eslint-disable i18next/no-literal-string */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import styles from './ReciterAdjustment.module.scss';

import { getAvailableReciters } from 'src/api';
import useGetQueryParamOrReduxValue from 'src/hooks/useGetQueryParamOrReduxValue';
import { setReciter } from 'src/redux/slices/AudioPlayer/state';
import { makeAvailableRecitersUrl } from 'src/utils/apiPaths';
import QueryParam from 'types/QueryParam';
import Reciter from 'types/Reciter';

const ReciterAdjustment: React.FC = () => {
  const dispatch = useDispatch();
  const { lang } = useTranslation();

  const { data, error } = useSWRImmutable(makeAvailableRecitersUrl(lang), () =>
    getAvailableReciters(lang).then((res) =>
      res.status === 500 ? Promise.reject(error) : Promise.resolve(res.reciters),
    ),
  );
  const { value: selectedReciterId }: { value: number } = useGetQueryParamOrReduxValue(
    QueryParam.Reciter,
  );
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
        value={selectedReciterId}
      >
        {(reciters as Reciter[]).map((reciter) => (
          <option key={reciter.id} value={reciter.id}>
            {reciter.translatedName.name}
          </option>
        ))}
      </select>
    </label>
  );
};

export default ReciterAdjustment;
