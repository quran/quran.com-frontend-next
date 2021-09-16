/* eslint-disable react/no-danger */
import React, { MouseEvent } from 'react';
import Button, { ButtonSize, ButtonShape, ButtonType } from 'src/components/dls/Button/Button';
import CloseIcon from '../../../../../public/icons/close.svg';
import styles from './FootnoteText.module.scss';

interface FootnoteTextProps {
  text: string;
  onCloseClicked: () => void;
  onTextClicked?: (event: MouseEvent, isSubFootnote?: boolean) => void;
}

const FootnoteText: React.FC<FootnoteTextProps> = ({ text, onCloseClicked, onTextClicked }) => (
  <div className={styles.footnoteContainer}>
    <div className={styles.header}>
      <p>Footnote</p>
      <Button
        size={ButtonSize.Small}
        shape={ButtonShape.Circle}
        type={ButtonType.Secondary}
        onClick={onCloseClicked}
      >
        <CloseIcon />
      </Button>
    </div>
    <div
      className={styles.footnote}
      dangerouslySetInnerHTML={{ __html: text }}
      {...(onTextClicked && { onClick: onTextClicked })}
    />
  </div>
);

export default FootnoteText;
