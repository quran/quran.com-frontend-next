import { useState } from 'react';

import Fuse from 'fuse.js';
import groupBy from 'lodash/groupBy';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import IconSearch from '../../../../public/icons/search.svg';

import styles from './SearchSelectionBody.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import Input from 'src/components/dls/Forms/Input';
import { selectSelectedTafsirs, setSelectedTafsirs } from 'src/redux/slices/QuranReader/tafsirs';
import { makeTafsirsUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import { TafsirsResponse } from 'types/ApiResponses';
import TafsirInfo from 'types/TafsirInfo';

const filterTafsirs = (translations, searchQuery: string): TafsirInfo[] => {
  const fuse = new Fuse(translations, {
    keys: ['name', 'languageName', 'authorName'],
    threshold: 0.3,
  });

  const filteredTranslations = fuse.search(searchQuery).map(({ item }) => item);
  return filteredTranslations as TafsirInfo[];
};

const TafsirsSelectionBody = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const selectedTafsirs = useSelector(selectSelectedTafsirs, areArraysEqual);
  const { lang } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const onTranslationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedTranslationId = e.target.value;

    // when the checkbox is checked
    // add the selectedTranslationId to redux
    // if unchecked, remove it from redux
    const nextTafsirs = e.target.checked
      ? [...selectedTafsirs, Number(selectedTranslationId)]
      : selectedTafsirs.filter((id) => id !== Number(selectedTranslationId)); // remove the id

    dispatch(setSelectedTafsirs({ tafsirs: nextTafsirs, locale: lang }));
  };

  return (
    <div>
      <div className={styles.searchInputContainer}>
        <Input
          prefix={<IconSearch />}
          id="translations-search"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('settings.search-translations')}
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
                  <div className={styles.group}>
                    <div className={styles.language}>{language}</div>
                    {tafsirs.map((tafsir) => (
                      <div key={tafsir.id} className={styles.item}>
                        <input
                          id={tafsir.id.toString()}
                          type="checkbox"
                          value={tafsir.id}
                          checked={selectedTafsirs.includes(tafsir.id)}
                          onChange={onTranslationsChange}
                        />
                        <label className={styles.label} htmlFor={tafsir.id.toString()}>
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
