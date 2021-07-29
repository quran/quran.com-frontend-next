import React from 'react';
import styled from 'styled-components';

export enum IconColor {
  default = 'default',
  primary = 'primary',
  secondary = 'secondary',
}
export enum IconSize {
  Xsmall = 'xsmall',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

export const ICON_SIZES = {
  [IconSize.Xsmall]: {
    width: 16,
    height: 16,
  },
  [IconSize.Small]: {
    width: 20,
    height: 20,
  },
  [IconSize.Medium]: {
    width: 32,
    height: 32,
  },
  [IconSize.Large]: {
    width: 36,
    height: 36,
  },
};

type IconContainerProps = {
  icon: React.ReactNode;
  size?: IconSize;
  color?: IconColor;
};
const IconContainer = ({
  icon,
  size = IconSize.Medium,
  color = IconColor.default,
}: IconContainerProps) => {
  return (
    <StyledIcon size={size} color={color}>
      {icon}
    </StyledIcon>
  );
};

const StyledIcon = styled.span<{ size: IconSize; color: IconColor }>`
  > svg {
    height: ${(props) => ICON_SIZES[props.size].height}px;
    width: ${(props) => ICON_SIZES[props.size].width}px;

    path {
      ${(props) =>
        props.color === IconColor.default && `fill: ${props.theme.colors.primary.medium}`}
      ${(props) =>
        props.color === IconColor.primary && `fill: ${props.theme.colors.primary.medium}`}
      ${(props) =>
        props.color === IconColor.secondary && `fill: ${props.theme.colors.secondary.medium}`}
    }
  }
`;

export default IconContainer;
