import React from 'react';
import { CENTER_VERTICALLY } from 'src/styles/utility';
import styled from 'styled-components';
import Link from 'next/link';
import { isIOS } from 'react-device-detect';

type ButtonProps = {
  size?: ButtonSizes;
  text?: string;
  name?: string;
  disabled?: boolean;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  icon?: React.ReactNode;
};

export enum ButtonSizes {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}
const BUTTON_SIZES = {
  medium: {
    icon: {
      width: 32,
      height: 32,
    },
    iconContainer: {
      width: 44,
      height: 44,
    },
  },
  small: {
    icon: {
      width: 24,
      height: 24,
    },
    iconContainer: {
      width: 40,
      height: 40,
    },
  },
};

const Button = ({ size = ButtonSizes.Medium, text, disabled, href, icon }: ButtonProps) => {
  return (
    <Container disabled={disabled} size={size} href={href}>
      {icon && <IconContainer size={size}>{icon}</IconContainer>}
      {text}
    </Container>
  );
};

const Container = ({ children, disabled, size, href }) => {
  if (href) {
    return (
      <Link href={href} passHref>
        <StyledAnchor>
          <StyledContainer disabled={disabled} size={size}>
            {children}
          </StyledContainer>
        </StyledAnchor>
      </Link>
    );
  }

  return (
    <StyledContainer disabled={disabled} size={size}>
      {children}
    </StyledContainer>
  );
};

const StyledContainer = styled.button<ButtonProps>`
  cursor: pointer;
  border-radius: ${(props) => props.theme.borderRadiuses.circle};
  border: none;
  height: ${(props) => BUTTON_SIZES[props.size].iconContainer.height}px;
  width: ${(props) => BUTTON_SIZES[props.size].iconContainer.width}px;
  display: inline-block;
  align-items: center;
  background: transparent;
  &:hover {
    background: ${(props) => props.theme.colors.background.fadedGreyScale};
  }
  ${(props) =>
    props.disabled &&
    `cursor: default;
  opacity: ${props.theme.opacity[50]};`};
`;

const IconContainer = styled.div<ButtonProps>`
  ${CENTER_VERTICALLY}

  > svg {
    margin: auto;
    height: ${(props) => BUTTON_SIZES[props.size].icon.height}px;
    width: ${(props) => BUTTON_SIZES[props.size].icon.width}px;

    /* Fix SVG alignment bug on iOS */
    ${isIOS &&
    `position: relative;
    left: 50%;
    -webkit-transform: translateX(-50%);
    -ms-transform: translateX(-50%);
    transform: translateX(-50%);`}
  }
`;
const StyledAnchor = styled.a`
  text-decoration: none;
`;

export default Button;
