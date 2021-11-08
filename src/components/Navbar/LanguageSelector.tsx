import React from 'react';

import setLanguage from 'next-translate/setLanguage';
import useTranslation from 'next-translate/useTranslation';

import styles from './LanguageSelector.module.scss';

import i18nConfig from 'i18n.json';
import Select from 'src/components/dls/Forms/Select';

const { locales } = i18nConfig;

const LANGUAGE_NAMES = {
  en: 'English',
  ar: 'العربية',
  bn: 'বাংলা',
  fa: 'فارسی',
  fr: 'Français',
  id: 'Indonesia',
  it: 'Inglese',
  nl: 'Dutch',
  pt: 'Português',
  ru: 'русский',
  sq: 'Shqip',
  th: 'ภาษาไทย',
  tr: 'Türkçe',
  ur: 'اردو',
  zh: '简体中文',
  ms: 'bahasa Melayu',
};
const options = locales.map((lng) => ({
  label: LANGUAGE_NAMES[lng],
  value: lng,
}));

const LanguageSelector = () => {
  const { lang } = useTranslation();

  const onChange = async (value: string) => {
    await setLanguage(value);
  };

  return (
    <div className={styles.container}>
      <Select
        id="locale"
        name="locale"
        options={options}
        value={lang}
        onChange={onChange}
        defaultStyle={false}
        className={styles.select}
      />
    </div>
  );
};

export default LanguageSelector;
