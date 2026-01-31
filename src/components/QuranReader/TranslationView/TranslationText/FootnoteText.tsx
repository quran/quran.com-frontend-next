/* eslint-disable react/no-danger */

import React, { MouseEvent, useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './FootnoteText.module.scss';
import transStyles from './TranslationText.module.scss';

import Button, { ButtonSize, ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import Spinner from '@/dls/Spinner/Spinner';
import CloseIcon from '@/icons/close.svg';
import Language from '@/types/Language';
import { getLanguageDataById, findLanguageIdByLocale, toLocalizedNumber } from '@/utils/locale';
import { formatVerseReferencesToLinks, isNumericString } from '@/utils/string';
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

  // App locale language data (for container/header direction)
  const appLanguageData = useMemo(() => {
    const appLanguageId = findLanguageIdByLocale(lang as Language);
    return getLanguageDataById(appLanguageId);
  }, [lang]);

  // Footnote content language data (for text direction and font)
  const footnoteLanguageData = useMemo(() => {
    const appLanguageId = findLanguageIdByLocale(lang as Language);
    const footnoteLanguageId = footnote?.languageId || appLanguageId;
    return getLanguageDataById(footnoteLanguageId);
  }, [footnote?.languageId, lang]);

  // Localize the footnote number if it's numeric
  const localizedFootnoteName = useMemo(() => {
    if (!footnoteName || !isNumericString(footnoteName)) return footnoteName;
    return toLocalizedNumber(Number(footnoteName), lang);
  }, [footnoteName, lang]);

  const updatedText = useMemo(() => {
    if (!footnote?.text) return '';
    return formatVerseReferencesToLinks(footnote.text);
  }, [footnote?.text]);

  return (
    <div
      className={classNames(styles.footnoteContainer, transStyles[appLanguageData.direction])}
      data-testid="footnote-content"
    >
      <div className={styles.header}>
        <p>
          {t('footnote')} {localizedFootnoteName ? `- ${localizedFootnoteName}` : null}
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
            transStyles[footnoteLanguageData.direction],
            transStyles[footnoteLanguageData.font],
          )}
          dangerouslySetInnerHTML={{ __html: updatedText }}
          {...(onTextClicked && { onClick: onTextClicked })}
        />
      )}
    </div>
  );
};

export default FootnoteText;
