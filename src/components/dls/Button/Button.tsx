import Image from 'next/image';
import React from 'react';
import { CenterVertically } from 'src/styles/utility';
import styled from 'styled-components';

type ButtonProps = {
  iconHref?: string;
  iconAlt?: string;
  size?: ButtonSizes;
  text?: string;
  name?: string;
  disabled?: boolean;
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

const Button = ({ iconHref, iconAlt, size = ButtonSizes.Medium, text, disabled }: ButtonProps) => {
  return (
    <Container disabled={disabled} size={size}>
      {iconHref && (
        <CenterVertically>
          <Icon
            src={iconHref}
            alt={iconAlt || iconHref}
            width={BUTTON_SIZES[size].icon.width}
            height={BUTTON_SIZES[size].icon.height}
          />
        </CenterVertically>
      )}
      {text}
    </Container>
  );
};

const Container = styled.button<ButtonProps>`
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

const Icon = styled(Image)`
  div {
    margin: 0 auto;
  }
`;
export default Button;
