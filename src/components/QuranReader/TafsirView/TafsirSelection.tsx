import classNames from 'classnames';
import capitalize from 'lodash/capitalize';
import useTranslation from 'next-translate/useTranslation';

import styles from './TafsirView.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import Button, { ButtonSize } from 'src/components/dls/Button/Button';
import Select, { SelectSize } from 'src/components/dls/Forms/Select';
import { makeTafsirsUrl } from 'src/utils/apiPaths';
import { TafsirsResponse } from 'types/ApiResponses';

type TafsirSelectionProps = {
  selectedTafsirs: number[];
  onTafsirSelected: (tafsirId: number) => void;
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  languageOptions: string[];
};
const TafsirAndLanguageSelection = ({
  selectedTafsirs,
  onTafsirSelected,
  selectedLanguage,
  onSelectLanguage,
  languageOptions,
}: TafsirSelectionProps) => {
  const { lang } = useTranslation();
  return (
    <DataFetcher
      queryKey={makeTafsirsUrl(lang)}
      render={(data: TafsirsResponse) => {
        return (
          <div className={styles.tafsirSelectionContainer}>
            <Select
              className={styles.languageSelection}
              size={SelectSize.Small}
              id="lang-selection"
              name="lang-selection"
              options={languageOptions.map((lng) => ({
                label: capitalize(lng),
                value: lng,
              }))}
              onChange={onSelectLanguage}
              value={selectedLanguage}
            />
            {data.tafsirs
              .filter(
                (tafsir) =>
                  tafsir.languageName.toLowerCase() === selectedLanguage.toLowerCase() ||
                  selectedTafsirs.includes(tafsir.id),
              )
              .map((tafsir) => {
                const selected = selectedTafsirs.includes(tafsir.id);
                return (
                  <Button
                    onClick={() => onTafsirSelected(tafsir.id)}
                    size={ButtonSize.Small}
                    key={tafsir.id}
                    className={classNames(styles.tafsirSelectionItem, {
                      [styles.tafsirItemSelected]: selected,
                    })}
                  >
                    {tafsir.name}
                  </Button>
                );
              })}
          </div>
        );
      }}
    />
  );
};

export default TafsirAndLanguageSelection;
