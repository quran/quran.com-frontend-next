import React from 'react';
import Element from 'react-scroll/modules/components/Element';
import styled from 'styled-components';
import QuranTranslation from '../dls/QuranTranslation/QuranTranslation';
import VerseType from '../../../types/VerseType';
import VerseText from './VerseText';

const VerseContainer = styled(Element)`
  direction: rtl;
`;

type VerseProps = {
  verse: VerseType;
};

const Verse = ({ verse }: VerseProps) => (
  <VerseContainer>
    <VerseText verse={verse} />
    {verse.translations?.map((translation) => (
      <QuranTranslation key={translation.id} translation={translation} />
    ))}
  </VerseContainer>
);

export default Verse;
