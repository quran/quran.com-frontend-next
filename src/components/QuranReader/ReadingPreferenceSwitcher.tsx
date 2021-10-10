import { useDispatch, useSelector } from 'react-redux';

import styles from './ReadingPreferenceSwitcher.module.scss';

import Switch from 'src/components/dls/Switch/Switch';
import {
  selectReadingPreference,
  setReadingPreference,
} from 'src/redux/slices/QuranReader/readingPreferences';
import { ReadingPreference } from 'types/QuranReader';

const readingPreferencesOptions = [
  { name: 'Translation', value: ReadingPreference.Translation },
  { name: 'Reading', value: ReadingPreference.Reading },
];

const ReadingPreferenceSwitcher = () => {
  const readingPreference = useSelector(selectReadingPreference);
  const dispatch = useDispatch();
  return (
    <div className={styles.container}>
      <Switch
        items={readingPreferencesOptions}
        selected={readingPreference}
        onSelect={(view) => {
          dispatch(setReadingPreference(view as ReadingPreference));
        }}
      />
    </div>
  );
};
export default ReadingPreferenceSwitcher;
