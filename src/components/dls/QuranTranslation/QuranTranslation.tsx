import React from 'react';
import TranslationType from '../../../../types/TranslationType';
import Text from '../Text/Text';

type QuranTranslationProps = {
  translation: TranslationType;
};

const QuranTranslation = ({ translation }: QuranTranslationProps) => (
  <>
    <Text primary small>
      {translation.resourceName}
    </Text>
    <Text large dangerouslySetInnerHTML={{ __html: translation.text }} />
  </>
);

export default QuranTranslation;
