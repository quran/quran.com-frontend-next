import styles from './TranslationGroup.module.scss';

import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import AvailableTranslation from 'types/AvailableTranslation';

type TranslationGroupProps = {
  language: string;
  translations: AvailableTranslation[];
  selectedTranslations: string[];
  onTranslationsChange: (translationsId: string[]) => void;
};
const TranslationGroup = ({
  language,
  translations,
  selectedTranslations,
  onTranslationsChange,
}: TranslationGroupProps) => {
  const areAllTranslationsSelected = translations.every((translation) =>
    selectedTranslations.includes(translation.id.toString()),
  );

  const areSomeTranslationsSelected = translations.some((translation) =>
    selectedTranslations.includes(translation.id.toString()),
  );

  const onLanguageSelected = () => {
    const nextSelectedTranslations = areAllTranslationsSelected
      ? []
      : translations.map((translation) => translation.id.toString());
    onTranslationsChange(nextSelectedTranslations);
  };

  const onSelectedTranslationsChange = (translationId: number) => (checked: boolean) => {
    const nextTranslations = checked
      ? [...selectedTranslations, translationId.toString()]
      : selectedTranslations.filter((id) => id !== translationId.toString());
    onTranslationsChange(nextTranslations);
  };

  let languageCheckboxCheckedStatus;
  if (areSomeTranslationsSelected) languageCheckboxCheckedStatus = 'indeterminate';
  if (areAllTranslationsSelected) languageCheckboxCheckedStatus = true;
  if (!areSomeTranslationsSelected && !areAllTranslationsSelected) {
    languageCheckboxCheckedStatus = false;
  }

  return (
    <div key={language}>
      <span className={styles.header}>
        <Checkbox
          id={language}
          checked={languageCheckboxCheckedStatus}
          label={language}
          onChange={onLanguageSelected}
        />
      </span>
      <div className={styles.itemsContainer}>
        {translations
          .sort((a: AvailableTranslation, b: AvailableTranslation) =>
            a.authorName.localeCompare(b.authorName),
          )
          .map((translation: AvailableTranslation) => (
            <div key={translation.id} className={styles.item}>
              <Checkbox
                id={translation.id.toString()}
                checked={selectedTranslations.includes(translation.id.toString())}
                label={translation.translatedName.name}
                onChange={onSelectedTranslationsChange(translation.id)}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default TranslationGroup;
