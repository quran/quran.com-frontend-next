import { useState } from 'react';

import Fuse from 'fuse.js';
import groupBy from 'lodash/groupBy';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './SearchSelectionBody.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import Input from 'src/components/dls/Forms/Input';
import { SearchIcon } from 'src/components/Icons';
import { selectSelectedTafsirs, setSelectedTafsirs } from 'src/redux/slices/QuranReader/tafsirs';
import { makeTafsirsUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import {
  logEmptySearchResults,
  logValueChange,
  logItemSelectionChange,
} from 'src/utils/eventLogger';
import { TafsirsResponse } from 'types/ApiResponses';
import TafsirInfo from 'types/TafsirInfo';

const filterTafsirs = (tafsirs, searchQuery: string): TafsirInfo[] => {
  const fuse = new Fuse(tafsirs, {
    keys: ['name', 'languageName', 'authorName'],
    threshold: 0.3,
  });

  const filteredTafsirs = fuse.search(searchQuery).map(({ item }) => item);
  if (!filteredTafsirs.length) {
    logEmptySearchResults(searchQuery, 'settings_drawer_tafsir');
  }
  return filteredTafsirs as TafsirInfo[];
};

const TafsirsSelectionBody = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const selectedTafsirs = useSelector(selectSelectedTafsirs, areArraysEqual);
  const { lang } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const onTafsirsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedTafsirId = e.target.value;
    const isChecked = e.target.checked;

    // when the checkbox is checked
    // add the selectedTranslationId to redux
    // if unchecked, remove it from redux
    const nextTafsirs = isChecked
      ? [...selectedTafsirs, selectedTafsirId]
      : selectedTafsirs.filter((id) => id !== selectedTafsirId); // remove the id

    logItemSelectionChange('tafsir', selectedTafsirId, isChecked);
    logValueChange('selected_tafsirs', selectedTafsirs, nextTafsirs);
    dispatch(setSelectedTafsirs({ tafsirs: nextTafsirs, locale: lang }));
  };

  return (
    <div>
      <div className={styles.searchInputContainer}>
        <Input
          prefix={<SearchIcon />}
          id="tafsirs-search"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('settings.search-tafsirs')}
          fixedWidth={false}
        />
      </div>
      <DataFetcher
        queryKey={makeTafsirsUrl(lang)}
        render={(data: TafsirsResponse) => {
          const filteredTafsirs = searchQuery
            ? filterTafsirs(data.tafsirs, searchQuery)
            : data.tafsirs;
          const tafsirsByLanguages = groupBy(filteredTafsirs, 'languageName');
          return (
            <div>
              {Object.entries(tafsirsByLanguages).map(([language, tafsirs]) => {
                return (
                  <div className={styles.group} key={language}>
                    <div className={styles.language}>{language}</div>
                    {tafsirs.map((tafsir) => (
                      <div key={tafsir.slug} className={styles.item}>
                        <input
                          id={tafsir.slug.toString()}
                          type="checkbox"
                          value={tafsir.slug}
                          checked={selectedTafsirs.includes(tafsir.slug)}
                          onChange={onTafsirsChange}
                        />
                        <label className={styles.label} htmlFor={tafsir.slug.toString()}>
                          <span>{tafsir.name}</span>{' '}
                          <span className={styles.author}>{tafsir.authorName}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        }}
      />
    </div>
  );
};

export default TafsirsSelectionBody;
