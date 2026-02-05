/* eslint-disable react/no-danger */
import React, { useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './TranslatedAyah.module.scss';

import Button, { ButtonSize, ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import Spinner from '@/dls/Spinner/Spinner';
import CloseIcon from '@/icons/close.svg';
import Language from '@/types/Language';
import { logButtonClick } from '@/utils/eventLogger';
import { getLanguageDataById, findLanguageIdByLocale, toLocalizedNumber } from '@/utils/locale';
import { isNumericString } from '@/utils/string';

type InlineFootnoteProps = {
  footnoteName: string | null;
  footnoteText?: string;
  isLoading: boolean;
  direction: string;
  onClose: () => void;
};

/**
 * Renders an inline footnote that expands below the ayah.
 *
 * @returns {JSX.Element} The inline footnote component
 */
const InlineFootnote: React.FC<InlineFootnoteProps> = ({
  footnoteName,
  footnoteText,
  isLoading,
  direction,
  onClose,
}) => {
  const { t, lang } = useTranslation('quran-reader');
  const { t: tCommon } = useTranslation('common');

  // App locale language data (for container/header direction)
  const appLanguageData = useMemo(() => {
    const appLanguageId = findLanguageIdByLocale(lang as Language);
    return getLanguageDataById(appLanguageId);
  }, [lang]);

  // Localize the footnote number if it's numeric
  const localizedFootnoteName = useMemo(() => {
    if (!footnoteName || !isNumericString(footnoteName)) return footnoteName;
    return toLocalizedNumber(Number(footnoteName), lang);
  }, [footnoteName, lang]);

  const handleClose = () => {
    logButtonClick('reading_translation_footnote_close_button');
    onClose();
  };

  return (
    <div className={classNames(styles.footnoteContainer, styles[appLanguageData.direction])}>
      <div className={styles.footnoteHeader}>
        <span className={styles.footnoteTitle}>
          {t('footnote')} {localizedFootnoteName ? `- ${localizedFootnoteName}` : null}
        </span>
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Ghost}
          shape={ButtonShape.Circle}
          onClick={handleClose}
          ariaLabel={tCommon('close')}
        >
          <CloseIcon />
        </Button>
      </div>
      {isLoading ? (
        <Spinner />
      ) : (
        <div
          className={classNames(styles.footnoteText, styles[direction])}
          dangerouslySetInnerHTML={{ __html: footnoteText || '' }}
        />
      )}
    </div>
  );
};

export default InlineFootnote;
