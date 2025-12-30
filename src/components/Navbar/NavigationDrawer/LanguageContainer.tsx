import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './LanguageContainer.module.scss';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import useLanguageChange from '@/hooks/useLanguageChange';
import IconArrowLeft from '@/icons/arrow-left.svg';
import { getLocaleName } from '@/utils/locale';
import i18nConfig from 'i18n.json';

const { locales } = i18nConfig;

interface LanguageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  show: boolean;
  onBack: () => void;
}

const LanguageContainer: React.FC<LanguageContainerProps> = ({ show, onBack, ...props }) => {
  const { t, lang } = useTranslation('common');
  const { isChangingLanguage, changingLocale, onLanguageChange } = useLanguageChange();

  const handleLanguageChange = async (newLocale: string) => {
    await onLanguageChange(newLocale, onBack);
  };

  return (
    <div
      {...props}
      role="dialog"
      aria-modal="true"
      aria-hidden={!show}
      aria-labelledby="language-dialog-title"
      data-testid="language-container"
      className={classNames(
        styles.languageContainer,
        {
          [styles.show]: show,
        },
        props.className,
      )}
    >
      <div className={styles.languageHeader}>
        <Button
          prefix={<IconArrowLeft />}
          variant={ButtonVariant.Ghost}
          size={ButtonSize.Small}
          onClick={onBack}
          className={styles.backButton}
          isDisabled={isChangingLanguage}
        >
          <span id="language-dialog-title" className={styles.languageTitle}>
            {t('select-language')}
          </span>
        </Button>
      </div>
      <div className={styles.languageList}>
        {locales.map((locale) => (
          <Button
            key={locale}
            onClick={() => handleLanguageChange(locale)}
            variant={ButtonVariant.Ghost}
            aria-current={locale === lang ? 'true' : undefined}
            className={classNames(styles.languageItem, {
              [styles.selected]: locale === lang,
            })}
            data-testid={`language-item-${locale}`}
            isLoading={isChangingLanguage && changingLocale === locale}
            isDisabled={isChangingLanguage}
          >
            {getLocaleName(locale)}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default LanguageContainer;
