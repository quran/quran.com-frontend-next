/* eslint-disable react/no-danger */

import React, { MouseEvent } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './FootnoteText.module.scss';
import transStyles from './TranslationText.module.scss';

import Button, { ButtonSize, ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import Spinner from '@/dls/Spinner/Spinner';
import CloseIcon from '@/icons/close.svg';
import { getLanguageDataById, findLanguageIdByLocale } from '@/utils/locale';
import Footnote from 'types/Footnote';

interface FootnoteTextProps {
  footnoteName?: string; // can be a number or a string (e.g. "sg" or "pl")
  footnote: Footnote;
  onCloseClicked: () => void;
  onTextClicked?: (event: MouseEvent, isSubFootnote?: boolean) => void;
  isLoading?: boolean;
}

const FootnoteText: React.FC<FootnoteTextProps> = ({
  footnoteName,
  footnote,
  onCloseClicked,
  onTextClicked,
  isLoading,
}) => {
  const { t, lang } = useTranslation('quran-reader');

  const languageId = footnote?.languageId || findLanguageIdByLocale(lang);
  const landData = getLanguageDataById(languageId);

  return (
    <div className={styles.footnoteContainer}>
      <div className={styles.header}>
        <p>
          {t('footnote')} {footnoteName ? `- ${footnoteName}` : null}
        </p>
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Ghost}
          shape={ButtonShape.Circle}
          onClick={onCloseClicked}
        >
          <CloseIcon />
        </Button>
      </div>
      {isLoading ? (
        <Spinner />
      ) : (
        <div
          className={classNames(
            styles.text,
            transStyles[landData.direction],
            transStyles[landData.font],
          )}
          dangerouslySetInnerHTML={{ __html: footnote.text }}
          {...(onTextClicked && { onClick: onTextClicked })}
        />
      )}
    </div>
  );
};

export default FootnoteText;
