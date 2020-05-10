import styled, { css } from 'styled-components';

const primaryColor = css`
  color: ${({ theme }) => theme.colors.primary};
`;

const largeSize = css`
  font-size: ${({ theme }) => theme.fontSizes[2]};
`;

const smallSize = css`
  font-size: ${({ theme }) => theme.fontSizes[1]};
`;

const miniSize = css`
  font-size: ${({ theme }) => theme.fontSizes[0]};
`;

type ColorProps = { primary?: boolean };

const color = css<ColorProps>`
  color: ${({ theme }) => theme.colors.text};
  ${(props) => props.primary && primaryColor}
`;

type FontSizeProps = { small?: boolean; mini?: boolean; large?: boolean };

const fontSize = css<FontSizeProps>`
  font-size: 1rem;
  ${(props) => props.small && smallSize};
  ${(props) => props.mini && miniSize};
  ${(props) => props.large && largeSize};
`;

const Text = styled.p<ColorProps & FontSizeProps & { isArabic?: boolean }>`
  ${color}
  ${fontSize}
  text-align: ${(props) => (props.isArabic ? 'right' : 'left')};

`;

export default Text;
