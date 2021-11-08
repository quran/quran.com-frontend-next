/* eslint-disable react/no-danger */

import React, { MouseEvent } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import CloseIcon from '../../../../../public/icons/close.svg';
import { getLanguageDirectionById, getLanguageFontById } from '../../../../utils/locale';

import styles from './FootnoteText.module.scss';
import transStyles from './TranslationText.module.scss';

import Button, { ButtonSize, ButtonShape, ButtonType } from 'src/components/dls/Button/Button';
import Spinner from 'src/components/dls/Spinner/Spinner';
import Footnote from 'types/Footnote';

interface FootnoteTextProps {
  footnote: Footnote;
  onCloseClicked: () => void;
  onTextClicked?: (event: MouseEvent, isSubFootnote?: boolean) => void;
  isLoading?: boolean;
}

const FootnoteText: React.FC<FootnoteTextProps> = ({
  footnote,
  onCloseClicked,
  onTextClicked,
  isLoading,
}) => {
  const { t } = useTranslation('quran-reader');
  // if the current locale is rtl and we have set-up the Footnote manually like in the case of Fadel Soliman, Bridges’ translation Tafsir "PL" or "SG".
  const direction = getLanguageDirectionById(footnote?.languageId);
  const langFont = getLanguageFontById(footnote?.languageId);

  return (
    <div className={styles.footnoteContainer}>
      <div className={styles.header}>
        <p>{t('footnote')}</p>
        <Button
          size={ButtonSize.Small}
          shape={ButtonShape.Circle}
          type={ButtonType.Secondary}
          onClick={onCloseClicked}
        >
          <CloseIcon />
        </Button>
      </div>
      {isLoading ? (
        <Spinner />
      ) : (
        <div
          className={classNames(styles.text, transStyles[direction], transStyles[langFont])}
          dangerouslySetInnerHTML={{ __html: footnote.text }}
          {...(onTextClicked && { onClick: onTextClicked })}
        />
      )}
    </div>
  );
};

export default FootnoteText;
