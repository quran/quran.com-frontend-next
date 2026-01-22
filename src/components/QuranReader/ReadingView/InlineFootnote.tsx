/* eslint-disable react/no-danger */
import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './TranslatedAyah.module.scss';

import Button, { ButtonSize, ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import Spinner from '@/dls/Spinner/Spinner';
import CloseIcon from '@/icons/close.svg';
import { logButtonClick } from '@/utils/eventLogger';

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
  const { t } = useTranslation('quran-reader');
  const { t: tCommon } = useTranslation('common');

  const handleClose = () => {
    logButtonClick('reading_translation_footnote_close_button');
    onClose();
  };

  return (
    <div className={styles.footnoteContainer}>
      <div className={styles.footnoteHeader}>
        <span className={styles.footnoteTitle}>
          {t('footnote')} {footnoteName ? `- ${footnoteName}` : null}
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
