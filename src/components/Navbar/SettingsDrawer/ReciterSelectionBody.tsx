import { useState } from 'react';

import Fuse from 'fuse.js';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import IconSearch from '../../../../public/icons/search.svg';

import styles from './ReciterSelectionBody.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import Input from 'src/components/dls/Forms/Input';
import RadioGroup, { RadioGroupOrientation } from 'src/components/dls/Forms/RadioGroup/RadioGroup';
import { selectReciter, setReciterAndPauseAudio } from 'src/redux/slices/AudioPlayer/state';
import { makeAvailableRecitersUrl } from 'src/utils/apiPaths';
import { logEmptySearchResults, logItemSelectionChange } from 'src/utils/eventLogger';
import { RecitersResponse } from 'types/ApiResponses';
import QueryParam from 'types/QueryParam';
import Reciter from 'types/Reciter';

export const filterReciters = (reciters, searchQuery: string): Reciter[] => {
  const fuse = new Fuse(reciters, {
    keys: ['name', 'languageName', 'translatedName.name', 'qirat.name', 'style.name'],
    threshold: 0.3,
  });

  const filteredReciter = fuse.search(searchQuery).map(({ item }) => item);
  if (!filteredReciter.length) {
    logEmptySearchResults(searchQuery, 'settings_drawer_translation');
  }
  return filteredReciter as Reciter[];
};

const DEFAULT_RECITATION_STYLE = 'Murattal';

const SettingsReciter = () => {
  const { lang, t } = useTranslation('common');
  const dispatch = useDispatch();
  const router = useRouter();
  const selectedReciter = useSelector(selectReciter, shallowEqual);
  const [searchQuery, setSearchQuery] = useState('');

  // given the reciterId, get the full reciter object.
  // and setReciter in redux
  const onSelectedReciterChange = (reciterId: string, reciters: Reciter[]) => {
    if (!reciterId) return;
    const reciter = reciters.find((r) => r.id === Number(reciterId));
    logItemSelectionChange('selected_reciter', reciter.id);
    router.query[QueryParam.Reciter] = String(reciter.id);
    router.push(router, undefined, { shallow: true });
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
        queryKey={makeAvailableRecitersUrl(lang)}
        render={(data: RecitersResponse) => {
          const filteredReciters = searchQuery
            ? filterReciters(data.reciters, searchQuery)
            : data.reciters;
          return (
            <RadioGroup
              value={selectedReciter.id.toString()}
              orientation={RadioGroupOrientation.Vertical}
              label="reciter"
              onChange={(newId) => onSelectedReciterChange(newId, data.reciters)}
              items={filteredReciters
                .sort((a, b) => (a.name > b.name ? 1 : -1))
                .map((reciter) => ({
                  value: reciter.id.toString(),
                  id: reciter.id.toString(),
                  label:
                    reciter.style.name !== DEFAULT_RECITATION_STYLE
                      ? `${reciter.translatedName.name}/${reciter.style.name}`
                      : reciter.translatedName.name,
                }))}
              renderItem={(item) => {
                const [reciterName, reciterStyle] = item.label.split('/');

                return (
                  <div className={styles.reciter} key={item.id}>
                    <RadioGroup.Item value={item.value} id={item.id}>
                      <RadioGroup.Indicator />
                    </RadioGroup.Item>
                    <label htmlFor={item.id} className={styles.reciterLabel}>
                      {reciterName}
                      {reciterStyle && (
                        <span className={styles.recitationStyle}>{reciterStyle}</span>
                      )}
                    </label>
                  </div>
                );
              }}
            />
          );
        }}
      />
    </div>
  );
};

export default SettingsReciter;
