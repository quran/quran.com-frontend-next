import styles from './TafsirView.module.scss';

import Select, { SelectSize } from 'src/components/dls/Forms/Select';

const SurahAndAyahSelection = () => {
  return (
    <div className={styles.surahAndAyahSelectionContainer}>
      <Select
        size={SelectSize.Small}
        id="surah-selection"
        name="surah-selection"
        options={[
          {
            label: 'Al-Fatihah',
            value: 'al-fatihah',
          },
        ]}
        value="al-fatihah"
      />
      <div style={{ marginInlineStart: '1rem' }}>
        <Select
          size={SelectSize.Small}
          id="ayah-selection"
          name="ayah-selection"
          options={[
            {
              label: '1',
              value: '1',
            },
          ]}
          value="al-fatihah"
        />
      </div>
    </div>
  );
};

export default SurahAndAyahSelection;
