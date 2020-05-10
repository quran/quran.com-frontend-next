import styled from 'styled-components';

const WordGlyph = styled.span<{ wordClassName?: string }>`
  -webkit-font-smoothing: antialiased;
  color: ${({ theme }) => theme.colors.text};
  font-size: 3rem;
  ${(props) => (props.wordClassName ? `font-family: ${props.wordClassName};` : '')}
`;

export default WordGlyph;
