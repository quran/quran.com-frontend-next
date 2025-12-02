import React, { MouseEvent } from 'react';

import FootnoteText from './FootnoteText';

import { logButtonClick } from '@/utils/eventLogger';
import type Footnote from 'types/Footnote';

interface Props {
  shouldShowFootnote: boolean;
  footnote: Footnote;
  subFootnote: Footnote;
  isLoading: boolean;
  activeFootnoteName: string | null;
  activeSubFootnoteName: string | null;
  onTextClicked: (event: MouseEvent, isSubFootnote?: boolean) => void;
  onHideFootnote: () => void;
  onResetFootnote: () => void;
  onResetSubFootnote: () => void;
}

const FootnoteAndSubFootnote: React.FC<Props> = ({
  shouldShowFootnote,
  footnote,
  subFootnote,
  isLoading,
  activeFootnoteName,
  activeSubFootnoteName,
  onTextClicked,
  onHideFootnote,
  onResetFootnote,
  onResetSubFootnote,
}) => {
  return (
    <>
      {shouldShowFootnote && (
        <FootnoteText
          footnoteName={activeFootnoteName || undefined}
          footnote={footnote}
          isLoading={isLoading}
          onCloseClicked={() => {
            logButtonClick('translation_footnote_close');
            if (isLoading) {
              onHideFootnote();
            } else {
              onResetFootnote();
            }
          }}
          onTextClicked={(event) => onTextClicked(event, true)}
        />
      )}
      {subFootnote && (
        <FootnoteText
          footnoteName={activeSubFootnoteName || undefined}
          footnote={subFootnote}
          onCloseClicked={onResetSubFootnote}
        />
      )}
    </>
  );
};

export default FootnoteAndSubFootnote;
