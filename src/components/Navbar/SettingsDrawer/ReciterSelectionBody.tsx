import { useState } from 'react';

import Fuse from 'fuse.js';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import IconSearch from '../../../../public/icons/search.svg';

import styles from './ReciterSelectionBody.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import Input from 'src/components/dls/Forms/Input';
import { selectReciter, setReciterAndPauseAudio } from 'src/redux/slices/AudioPlayer/state';
import { makeRecitersUrl } from 'src/utils/apiPaths';
import { RecitersResponse } from 'types/ApiResponses';
import Reciter from 'types/Reciter';

const filterReciters = (reciters, searchQuery: string): Reciter[] => {
  const fuse = new Fuse(reciters, {
    keys: ['name', 'languageName', 'authorName'],
    threshold: 0.3,
  });

  const filteredReciter = fuse.search(searchQuery).map(({ item }) => item);
  return filteredReciter as Reciter[];
};

const SettingsReciter = () => {
  const { lang, t } = useTranslation('common');
  const dispatch = useDispatch();
  const selectedReciter = useSelector(selectReciter, shallowEqual);
  const [searchQuery, setSearchQuery] = useState('');

  // given the reciterId, get the full reciter object.
  // and setReciter in redux
  const onSelectedReciterChange = (reciterId: string, reciters: Reciter[]) => {
    if (!reciterId) return;
    const reciter = reciters.find((r) => r.id === Number(reciterId));
    dispatch(setReciterAndPauseAudio({ reciter, locale: lang }));
  };

  return (
    <div>
      <div className={styles.searchInputContainer}>
        <Input
          prefix={<IconSearch />}
          id="translations-search"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('settings.search-reciter')}
          fixedWidth={false}
        />
      </div>
      <DataFetcher
        queryKey={makeRecitersUrl()}
        render={(data: RecitersResponse) => {
          const filteredReciters = searchQuery
            ? filterReciters(data.reciters, searchQuery)
            : data.reciters;
          return (
            <div>
              {filteredReciters.map((reciter) => (
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
