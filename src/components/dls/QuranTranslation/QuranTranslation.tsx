import React from 'react';
import TranslationType from '../../../../types/TranslationType';
import Text from '../Text/Text';

type QuranTranslationProps = {
  translation: TranslationType;
};

const QuranTranslation = ({ translation }: QuranTranslationProps) => (
  <>
    <Text>{translation.resourceName}</Text>
    <Text>{translation.text}/</Text>
  </>
);

export default QuranTranslation;
