import styled from 'styled-components';

const WordGlyph = styled.span<{ wordClassName?: string }>`
  -webkit-font-smoothing: antialiased;
  color: ${({ theme }): string => theme.colors.black};
  font-size: 3rem;
  ${(props): string => (props.wordClassName ? `font-family: ${props.wordClassName};` : '')}
`;

export default WordGlyph;
