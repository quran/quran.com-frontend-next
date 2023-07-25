/* eslint-disable react/no-danger */

import React, { MouseEvent, useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './FootnoteText.module.scss';
import transStyles from './TranslationText.module.scss';

import Button, { ButtonSize, ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import Spinner from '@/dls/Spinner/Spinner';
import CloseIcon from '@/icons/close.svg';
import { getLanguageDataById, findLanguageIdByLocale, toLocalizedNumber } from '@/utils/locale';
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

  const formattedFootnoteName = useMemo(() => {
    if (!footnoteName) return null;

    const footnoteNumber = Number(footnoteName);

    // if footnoteName is not numeric, return it
    if (Number.isNaN(footnoteNumber)) return footnoteName;

    // otherwise, localize the footnote number
    return toLocalizedNumber(footnoteNumber, lang);
  }, [footnoteName, lang]);

  return (
    <div className={styles.footnoteContainer}>
      <div className={styles.header}>
        <p>
          {t('footnote')} {formattedFootnoteName ? `- ${formattedFootnoteName}` : null}
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
