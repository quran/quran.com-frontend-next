import React from 'react';
import TranslationType from '../../../../types/TranslationType';

type QuranTranslationProps = {
  translation: TranslationType;
};

const QuranTranslation = ({ translation }: QuranTranslationProps) => (
  <>
    <span>{translation.resourceName}</span>
    <span>{translation.text}/</span>
  </>
);

export default QuranTranslation;
