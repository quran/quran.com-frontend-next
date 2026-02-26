/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { MouseEvent } from 'react';

import classNames from 'classnames';

import Reference from './Reference';
import styles from './TranslationText.module.scss';

interface Props {
  text: string;
  fontClass: string;
  direction: string;
  onTextClicked: (event: MouseEvent) => void;
  shouldShowReference?: boolean;
  chapterName?: string;
  reference?: string;
  lang: string;
  languageCode: string;
}

const TranslationAndReference: React.FC<Props> = ({
  text,
  fontClass,
  direction,
  onTextClicked,
  shouldShowReference = false,
  chapterName,
  reference,
  lang,
  languageCode,
}) => {
  return (
    <div
      className={classNames(
        styles.text,
        fontClass,
        styles[direction],
        shouldShowReference && styles.textCenter,
      )}
      lang={languageCode}
    >
      <div
        onClick={(event) => onTextClicked(event)}
        className={classNames(shouldShowReference && styles.innerText)}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: shouldShowReference ? `"${text}"` : text }}
      />
      {shouldShowReference && chapterName && reference && (
        <>
          {' '}
          <Reference reference={reference} chapterName={chapterName} lang={lang} />
        </>
      )}
    </div>
  );
};

export default TranslationAndReference;
