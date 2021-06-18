import React from 'react';
import styled from 'styled-components';
import { decamelizeKeys } from 'humps';

type MadaniWordTextProps = {
  text: string;
  fontVersion: string;
};

const UTHMANI_HAFS_FONTS = decamelizeKeys({
  qpcUthmaniHafs: 'UthmanicHafs1Ver17',
  textUthmani: 'Madani',
});

const MadaniWordText = (props: MadaniWordTextProps) => {
  const { text, fontVersion } = props;
  return <StyledHasfWordText fontVersion={fontVersion}>{text}</StyledHasfWordText>;
};

const StyledHasfWordText = styled.span<{ fontVersion: string }>`
  unicode-bidi: bidi-override;
  font-family: ${(props) => `${UTHMANI_HAFS_FONTS[props.fontVersion]}`};
`;

export default MadaniWordText;
