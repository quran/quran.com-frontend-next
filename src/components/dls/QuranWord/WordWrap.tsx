import styled from 'styled-components';

const WordWrap = styled.a<{ highlight?: boolean }>`
  -webkit-font-smoothing: antialiased;
  float: right;
  color: ${({ highlight, theme }): string => (highlight ? theme.colors.primary : 'initial')};
`;

export default WordWrap;
