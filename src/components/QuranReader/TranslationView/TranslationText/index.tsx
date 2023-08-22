/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-danger */

import React, { MouseEvent, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import FootnoteText from './FootnoteText';
import styles from './TranslationText.module.scss';

import { logButtonClick } from '@/utils/eventLogger';
import { getLanguageDataById } from '@/utils/locale';
import { getFootnote } from 'src/api';
import Footnote from 'types/Footnote';

interface Props {
  translationFontScale: number;
  text: string;
  resourceName?: string;
  languageId: number;
}

const TranslationText: React.FC<Props> = ({
  translationFontScale,
  text,
  languageId,
  resourceName,
}) => {
  const { t } = useTranslation('quran-reader');
  const [isLoading, setIsLoading] = useState(false);
  const [showFootnote, setShowFootnote] = useState(true);
  const [footnote, setFootnote] = useState<Footnote>(null);
  const [activeFootnoteName, setActiveFootnoteName] = useState<string | null>(null);
  const [activeSubFootnoteName, setActiveSubFootnoteName] = useState<string | null>(null);
  const [subFootnote, setSubFootnote] = useState<Footnote>(null);

  const PRE_DEFINED_FOOTNOTES = {
    sg: t('footnote-sg'),
    pl: t('footnote-pl'),
    dl: t('footnote-dl'),
  };

  const resetFootnote = () => {
    setFootnote(null);
    setSubFootnote(null);
    setIsLoading(false);
    setActiveFootnoteName(null);
    setActiveSubFootnoteName(null);
  };

  const resetSubFootnote = () => {
    setSubFootnote(null);
    setActiveSubFootnoteName(null);
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
   *    way as above (only happens with Bridge's Foundation translation, ex: Surah 30, Verse 11).
   *
   * @param {MouseEvent} event
   * @param {boolean} isSubFootnote whether we are handling a footnote or a sub-footnote (only happens
   *                                with Bridge's Foundation translation).
   */
  const onTextClicked = (event: MouseEvent, isSubFootnote = false) => {
    const target = event.target as HTMLElement;

    // if we just clicked on anything other than a footnote element, return early.
    if (target.tagName !== 'SUP') {
      return;
    }
    // we get the text inside the sup element and trim the extra spaces.
    const footnoteText = target.innerText.trim();

    // if it's the main footnote and not the sub footnote.
    if (!isSubFootnote) {
      const footNoteId = target.getAttribute('foot_note');

      // Set the activeFootnoteNumber to the current number of the footnote from the <sup> innerHTML
      setActiveFootnoteName(footnoteText);

      // if it's the normal case that needs us to call BE and not a fixed footnote like the ones found for Bridge's translation.
      if (footNoteId) {
        // if this is the second time to click the footnote, close it
        if (showFootnote && footnote && footnote.id === Number(footNoteId)) {
          logButtonClick('translation_footnote_double_click_to_close');
          resetFootnote();
        } else {
          logButtonClick('translation_show_footnote');
          resetSubFootnote();
          setShowFootnote(true);
          setIsLoading(true);
          getFootnote(footNoteId)
            .then((res) => {
              if (res.status !== 500) {
                setFootnote(res.footNote);
              }
            })
            .finally(() => {
              setIsLoading(false);
            });
        }
      } else if (footnote && footnote.id === footnoteText) {
        // if this is the second time we are clicking on the footnote, we close it.
        logButtonClick('translation_pre_defined_footnote_double_click_to_close');
        resetFootnote();
      } else if (PRE_DEFINED_FOOTNOTES[footnoteText]) {
        logButtonClick('translation_pre_defined_footnote');
        resetSubFootnote();
        setFootnote({
          id: footnoteText,
          text: PRE_DEFINED_FOOTNOTES[footnoteText],
        });
      }
    } else {
      // Set the activeSubFootnoteNumber to the current number of the footnote from the <sup> innerHTML
      setActiveSubFootnoteName(footnoteText);

      const subFootnoteId = `${footnote.id} - ${footnoteText}`;
      // if this is the second time we are clicking on the sub footnote, we close it.
      if (subFootnote && subFootnote.id === subFootnoteId) {
        logButtonClick('translation_sub_footnote_double_click_to_close');
        resetSubFootnote();
      } else if (PRE_DEFINED_FOOTNOTES[footnoteText]) {
        logButtonClick('translation_show_sub_footnote');
        setSubFootnote({
          id: subFootnoteId,
          text: PRE_DEFINED_FOOTNOTES[footnoteText],
        });
      }
    }
  };
  const hideFootnote = () => setShowFootnote(false);
  const langData = getLanguageDataById(languageId);

  const shouldShowFootnote = showFootnote && (footnote || isLoading);
  return (
    <div className={styles[`translation-font-size-${translationFontScale}`]}>
      <div
        onClick={(event) => onTextClicked(event)}
        className={classNames(styles.text, styles[langData.direction], styles[langData.font])}
        dangerouslySetInnerHTML={{ __html: text }}
      />
      {shouldShowFootnote && (
        <FootnoteText
          footnoteName={activeFootnoteName || undefined}
          footnote={footnote}
          isLoading={isLoading}
          onCloseClicked={() => {
            logButtonClick('translation_footnote_close');
            if (isLoading) {
              hideFootnote();
            } else {
              resetFootnote();
            }
          }}
          onTextClicked={(event) => onTextClicked(event, true)}
        />
      )}
      {subFootnote && (
        <FootnoteText
          footnoteName={activeSubFootnoteName || undefined}
          footnote={subFootnote}
          onCloseClicked={resetSubFootnote}
        />
      )}
      {resourceName && (
        <p
          className={classNames(
            styles.translationName,
            styles[langData.direction],
            styles[langData.font],
          )}
          // eslint-disable-next-line i18next/no-literal-string
        >
          — {resourceName}
        </p>
      )}
    </div>
  );
};

export default TranslationText;
