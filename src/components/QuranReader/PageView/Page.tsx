import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import VerseType from '../../../../types/VerseType';
import Line from './Line';
import groupLinesByVerses from './groupLinesByVerses';
import { selectQuranReaderStyles } from '../../../redux/slices/QuranReader/styles';

type PageProps = {
  verses: VerseType[];
};

const Page = ({ verses }: PageProps) => {
  const lines = useMemo(() => groupLinesByVerses(verses), [verses]);
  const quranReaderStyles = useSelector(selectQuranReaderStyles);

  return (
    <StyledPage>
      {Object.keys(lines).map((key) => (
        <Line words={lines[key]} key={[key, quranReaderStyles.quranFont].join('_')} />
      ))}
    </StyledPage>
  );
};

const StyledPage = styled.div`
  margin: 0 auto;
`;

export default React.memo(Page);
