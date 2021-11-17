/* eslint-disable react/no-danger */

import React, { MouseEvent } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import CloseIcon from '../../../../../public/icons/close.svg';

import styles from './FootnoteText.module.scss';

import Button, { ButtonSize, ButtonShape, ButtonType } from 'src/components/dls/Button/Button';
import Spinner from 'src/components/dls/Spinner/Spinner';
import textStyles from 'src/components/QuranReader/TextStyles.module.scss';
import { getLanguageDataById, findLanguageIdByLocale } from 'src/utils/locale';
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
  const { t, lang } = useTranslation('quran-reader');

  const languageId = footnote?.languageId || findLanguageIdByLocale(lang);
  const landData = getLanguageDataById(languageId);

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
          className={classNames(
            styles.text,
            textStyles[landData.direction],
            textStyles[landData.font],
          )}
          dangerouslySetInnerHTML={{ __html: footnote.text }}
          {...(onTextClicked && { onClick: onTextClicked })}
        />
      )}
    </div>
  );
};

export default FootnoteText;
