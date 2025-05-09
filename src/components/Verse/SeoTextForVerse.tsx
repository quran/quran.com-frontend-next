import React, { useMemo } from 'react';

import styles from './SeoTextForVerse.module.scss';

import Word from 'types/Word';

interface SeoTextForVerseProps {
  words: Word[];
}

/**
 * Renders the verse text in both textImlaeiSimple and textUthmani forms for SEO purposes.
 * This component is intended to be used in places where SEO is important (e.g., VerseText, PlainVerseText).
 * It only renders if the relevant text exists.
 *
 * @returns {JSX.Element | null} The SEO text elements or null if not available.
 */
const SeoTextForVerse: React.FC<SeoTextForVerseProps> = ({ words }) => {
  const seoTexts = useMemo(() => {
    const imlaei: string[] = [];
    const uthmani: string[] = [];
    words?.forEach((word) => {
      if (word?.textImlaeiSimple) imlaei.push(word?.textImlaeiSimple);
      if (word?.textUthmani) uthmani.push(word?.textUthmani);
    });
    return { imlaei, uthmani };
  }, [words]);

  if (seoTexts.imlaei.length === 0 && seoTexts.uthmani.length === 0) return null;

  return (
    <div className={styles.visuallyHidden}>
      {seoTexts.imlaei.length > 0 && <div>{seoTexts.imlaei.join(' ')}</div>}
      {seoTexts.uthmani.length > 0 && <div>{seoTexts.uthmani.join(' ')}</div>}
    </div>
  );
};

export default SeoTextForVerse;
