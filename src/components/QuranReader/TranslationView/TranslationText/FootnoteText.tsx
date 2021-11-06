/* eslint-disable react/no-danger */

import React, { MouseEvent } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import CloseIcon from '../../../../../public/icons/close.svg';

import styles from './FootnoteText.module.scss';

import Button, { ButtonSize, ButtonShape, ButtonType } from 'src/components/dls/Button/Button';
import Spinner from 'src/components/dls/Spinner/Spinner';
import useDirection from 'src/hooks/useDirection';

interface FootnoteTextProps {
  text: string;
  onCloseClicked: () => void;
  onTextClicked?: (event: MouseEvent, isSubFootnote?: boolean) => void;
  isLoading?: boolean;
  isStaticContent?: boolean;
}

const FootnoteText: React.FC<FootnoteTextProps> = ({
  text,
  onCloseClicked,
  onTextClicked,
  isLoading,
  isStaticContent = false,
}) => {
  const direction = useDirection();
  const { t } = useTranslation('quran-reader');
  // if the current locale is rtl and we have set-up the Footnote manually like in the case of Fadel Soliman, Bridges’ translation Tafsir "PL" or "SG".
  const isRtlFootnote = isStaticContent && direction === 'rtl';
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
          className={classNames(styles.footnote, {
            [styles.rtl]: isRtlFootnote,
            [styles.ltr]: !isRtlFootnote,
          })}
          dangerouslySetInnerHTML={{ __html: text }}
          {...(onTextClicked && { onClick: onTextClicked })}
        />
      )}
    </div>
  );
};

export default FootnoteText;
