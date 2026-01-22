import classNames from 'classnames';

import styles from './TafsirView.module.scss';

import Button, { ButtonSize } from '@/dls/Button/Button';
import CompactSelector from '@/dls/CompactSelector';
import Skeleton from '@/dls/Skeleton/Skeleton';
import SpinnerContainer from '@/dls/Spinner/SpinnerContainer';
import { TafsirsResponse } from '@/types/ApiResponses';
import { getLocaleNameByFullName } from '@/utils/locale';

type LanguageAndTafsirSelectionProps = {
  selectedTafsirIdOrSlug: number | string;
  onTafsirSelected: (tafsirId: number, tafsirSlug: string) => void;
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  languageOptions: string[];
  data: TafsirsResponse;
  isLoading: boolean;
  hasSeparateLayout?: boolean;
};
const LanguageAndTafsirSelection = ({
  selectedTafsirIdOrSlug,
  onTafsirSelected,
  selectedLanguage,
  onSelectLanguage,
  languageOptions,
  data,
  isLoading,
  hasSeparateLayout = false,
}: LanguageAndTafsirSelectionProps) => {
  if (!data) {
    return (
      <Skeleton className={classNames(styles.tafsirSkeletonItem, styles.tafsirSelectionSkeleton)} />
    );
  }
  const languageItems = languageOptions.map((lng) => ({
    id: lng,
    label: getLocaleNameByFullName(lng),
    value: lng,
  }));

  const handleLanguageChange = (values: string[]) => {
    if (values.length > 0) {
      onSelectLanguage(values[0]);
    }
  };

  const filteredTafsirs = data.tafsirs
    .filter(
      (tafsir) =>
        tafsir.languageName === selectedLanguage ||
        selectedTafsirIdOrSlug === tafsir.slug ||
        Number(selectedTafsirIdOrSlug) === tafsir.id,
    )
    .sort((a, b) => {
      // Move selected tafsir to the beginning
      const aSelected =
        selectedTafsirIdOrSlug === a.slug || Number(selectedTafsirIdOrSlug) === a.id;
      const bSelected =
        selectedTafsirIdOrSlug === b.slug || Number(selectedTafsirIdOrSlug) === b.id;
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });

  const languageSelector = (
    <CompactSelector
      id="tafsir-lang-selection"
      items={languageItems}
      selectedValues={selectedLanguage ? [selectedLanguage] : []}
      onChange={handleLanguageChange}
      isMultiSelect={false}
    />
  );

  const tafsirButtons = filteredTafsirs.map((tafsir) => {
    const selected =
      selectedTafsirIdOrSlug === tafsir.slug || Number(selectedTafsirIdOrSlug) === tafsir.id;
    return (
      <Button
        onClick={() => onTafsirSelected(tafsir.id, tafsir.slug)}
        size={ButtonSize.Small}
        key={tafsir.id}
        className={classNames(styles.tafsirSelectionItem, {
          [styles.tafsirItemSelected]: selected,
        })}
        data-testid={`tafsir-selection-${tafsir.slug}`}
        data-isselected={selected}
      >
        {tafsir.translatedName.name}
      </Button>
    );
  });

  if (hasSeparateLayout) {
    return (
      <SpinnerContainer isLoading={isLoading}>
        <div className={styles.tafsirSelectionWrapper}>
          {languageSelector}
          <div className={styles.tafsirButtonsScroll}>{tafsirButtons}</div>
        </div>
      </SpinnerContainer>
    );
  }

  return (
    <SpinnerContainer isLoading={isLoading}>
      <div className={styles.tafsirSelectionContainer}>
        {languageSelector}
        {tafsirButtons}
      </div>
    </SpinnerContainer>
  );
};

export default LanguageAndTafsirSelection;
