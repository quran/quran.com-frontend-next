import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './TafsirView.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import Button, { ButtonSize } from 'src/components/dls/Button/Button';
import { makeTafsirsUrl } from 'src/utils/apiPaths';
import { TafsirsResponse } from 'types/ApiResponses';

type TafsirSelectionProps = {
  selectedTafsirs: number[];
  onTafsirSelected: (tafsirId: number) => void;
  selectedLanguage: string;
};
const TafsirSelection = ({
  selectedTafsirs,
  onTafsirSelected,
  selectedLanguage,
}: TafsirSelectionProps) => {
  const { lang } = useTranslation();
  return (
    <DataFetcher
      queryKey={makeTafsirsUrl(lang)}
      render={(data: TafsirsResponse) => {
        return (
          <div className={styles.tafsirSelectionContainer}>
            {data.tafsirs
              .filter(
                (tafsir) => tafsir.languageName.toLowerCase() === selectedLanguage.toLowerCase(),
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

export default TafsirSelection;
