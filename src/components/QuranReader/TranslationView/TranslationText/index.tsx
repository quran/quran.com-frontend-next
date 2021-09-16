/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-danger */
import classNames from 'classnames';
import React, { MouseEvent, useState } from 'react';
import { getFootnote } from 'src/api';
import Footnote from 'types/Footnote';
import FootnoteText from './FootnoteText';
import styles from './TranslationText.module.scss';

interface Props {
  translationFontScale: number;
  text: string;
}

const PRE_DEFINED_FOOTNOTES = {
  sg: 'Singular',
  pl: 'Plural',
  dl: '<b>Dual</b> <br/> A form for verbs and pronouns in Arabic language when addressing two people',
};

const TranslationText: React.FC<Props> = ({ translationFontScale, text }) => {
  const [footnote, setFootnote] = useState<Footnote>(null);
  const [subFootnote, setSubFootnote] = useState<Footnote>(null);

  const resetFootnote = () => {
    setFootnote(null);
    setSubFootnote(null);
  };

  const resetSubFootnote = () => {
    setSubFootnote(null);
  };

  /**
   * Handle when the translation text is clicked. This is needed to handle when a footnote
   * is clicked since we receive the translation text as HTML from BE. Any footnote will
   * be inside an <sup>...</sup> element. so when the translation container is clicked
   * we check whether the clicked element is of tag name SUP and if so, we handle showing the
   * footnote as following:
   *
   * 1. If it's not a sub-footnote (a footnote inside a footnote) which is all translations
   *    except Bridge's Foundation translation:
   *    1. check if the sup element has foot_note attribute (the ID) and if it has:
   *        1. Check if we already have a footnote in the local state with the same ID:
   *            1. if yes, it means this is the second time the user clicks on the
   *               footnote so we should close the footnote.
   *            2. if no, it means we need to call BE to fetch the footnote text by its ID.
   *    2. if not, it means it's a pre-defined footnote and in this case, we access the text
   *       inside the element and check if it's in the list of pre-defined footnotes and if it
   *       is, we get the value from the pre-defined footnotes and assign it as the footnote
   *       text without having to call BE (only happens with Bridge's Foundation translation)
   * 2. If it's a sub-footnote it will only have pre-defined footnotes so we handle it the same
   *    way as above (only happens with Bridge's Foundation translation).
   *
   * @param {MouseEvent} event
   * @param {boolean} isSubFootnote whether we are handling a footnote or a sub-footnote (only happens
   *                                with Bridge's Foundation translation).
   */
  const onTextClicked = (event: MouseEvent, isSubFootnote = false) => {
    const target = event.target as HTMLElement;
    // if we just clicked on the footnote element
    if (target.tagName === 'SUP') {
      // if it's the main footnote and not the sub footnote.
      if (!isSubFootnote) {
        const footNoteId = target.getAttribute('foot_note');
        // if it's the normal case that needs us to call BE and not a fixed footnote like the ones found for Bridge's translation.
        if (footNoteId) {
          // if this is the second time to click the footnote, close it
          if (footnote && footnote.id === Number(footNoteId)) {
            resetFootnote();
          } else {
            resetSubFootnote();
            getFootnote(footNoteId).then((res) => {
              if (res.status !== 500) {
                setFootnote(res.footNote);
              }
            });
          }
        } else {
          // we get the text inside the sup element and trim the extra spaces.
          const footnoteText = target.innerText.trim();
          // if this is the second time we are clicking on the footnote, we close it.
          if (footnote && footnote.id === footnoteText) {
            resetFootnote();
          } else if (PRE_DEFINED_FOOTNOTES[footnoteText]) {
            resetSubFootnote();
            setFootnote({ id: footnoteText, text: PRE_DEFINED_FOOTNOTES[footnoteText] });
          }
        }
      } else {
        // we get the text inside the sup element and trim the extra spaces.
        const footnoteText = target.innerText.trim();
        const subFootnoteId = `${footnote.id} - ${footnoteText}`;
        // if this is the second time we are clicking on the sub footnote, we close it.
        if (subFootnote && subFootnote.id === subFootnoteId) {
          resetSubFootnote();
        } else if (PRE_DEFINED_FOOTNOTES[footnoteText]) {
          setSubFootnote({
            id: subFootnoteId,
            text: PRE_DEFINED_FOOTNOTES[footnoteText],
          });
        }
      }
    }
  };
  return (
    <>
      <div
        onClick={(event) => onTextClicked(event)}
        className={classNames(styles.text, styles[`translation-font-size-${translationFontScale}`])}
        dangerouslySetInnerHTML={{ __html: text }}
      />
      {footnote && (
        <FootnoteText
          text={footnote.text}
          onCloseClicked={resetFootnote}
          onTextClicked={(event) => onTextClicked(event, true)}
        />
      )}
      {subFootnote && <FootnoteText text={subFootnote.text} onCloseClicked={resetSubFootnote} />}
    </>
  );
};

export default TranslationText;
