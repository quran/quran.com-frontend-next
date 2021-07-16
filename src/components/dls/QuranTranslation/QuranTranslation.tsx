import React from 'react';
import Translation from '../../../../types/Translation';

type QuranTranslationProps = {
  translation: Translation;
};

const QuranTranslation = ({ translation }: QuranTranslationProps) => (
  <>
    <span>{translation.resourceName}</span>
    <span>{translation.text}/</span>
  </>
);

export default QuranTranslation;
