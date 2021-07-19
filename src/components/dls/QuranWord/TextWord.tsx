import React from 'react';
import styled from 'styled-components';
import { decamelizeKeys } from 'humps';
import { CharType } from 'types/Word';

type MadaniWordTextProps = {
  text: string;
  font: string;
  charType: string;
};

const DEFAULT_FONT_FAMILY = 'UthmanicHafs1Ver17';

const UTHMANI_HAFS_FONTS = decamelizeKeys({
  qpcUthmaniHafs: DEFAULT_FONT_FAMILY,
  textUthmani: 'meQuran',
  textIndopak: 'IndoPak',
});

const getFontFamily = (font: string, charType: string) => {
  if (charType === CharType.End) return DEFAULT_FONT_FAMILY;

  return UTHMANI_HAFS_FONTS[font] || DEFAULT_FONT_FAMILY;
};

const TextWord = (props: MadaniWordTextProps) => {
  const { text, font, charType } = props;
  return (
    <StyledHafsWordText font={font} charType={charType}>
      {text}
    </StyledHafsWordText>
  );
};

const StyledHafsWordText = styled.span<{ font: string; charType: string }>`
  unicode-bidi: bidi-override;
  line-height: normal;
  font-family: ${(props) => `${getFontFamily(props.font, props.charType)}`};
`;

export default TextWord;
