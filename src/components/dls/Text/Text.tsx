import styled from 'styled-components';

export enum TextAlign {
  Left = 'left',
  Right = 'right',
  Center = 'center',
  Justify = 'justify',
}

export enum TextColor {
  Default = 'default',
  Primary = 'primary',
  Secondary = 'secondary',
}

export enum TextSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

export enum TextWeight {
  Normal = 'normal',
  Bold = 'bold',
}

type TextProps = {
  children: React.ReactNode;
  color?: TextColor;
  align?: TextAlign;
  italic?: boolean;
  size?: TextSize;
  underline?: boolean;
  isInline?: boolean;
};

const Text = (props: TextProps) => {
  const { children } = props;
  return <Container {...props}>{children}</Container>;
};

const getTextColor = (props: any) => {
  const { color, theme } = props;
  if (color === TextColor.Primary) {
    return theme.colors.primary.medium;
  }
  if (color === TextColor.Secondary) {
    return theme.colors.secondary.medium;
  }

  return theme.colors.text.default;
};

const Container = styled.p<TextProps>`
  /* Text color */
  color: ${(props) => getTextColor(props)};
`;

export default Text;
