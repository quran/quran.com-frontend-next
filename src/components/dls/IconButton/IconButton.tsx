import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { resetButton } from '../../../utils/styles';

const iconButtonCss = (props) => ({
  '@selectors': {
    '[disabled]': {
      color: props.theme.colors.gray,
      cursor: 'not-allowed',
    },

    ':not([disabled]):hover': {
      color: props.theme.colors.gray,
    },
  },
});

const Button = styled.button`
  color: ${(props) => props.theme.colors.gray};
  padding: ${(props) => props.theme.base.px / 2};
  ${resetButton}
  ${iconButtonCss}
`;

export type IconButtonProps = {
  disabled?: boolean;
  children: ReactNode;
  id?: string;
  onClick?: () => void;
};

const IconButton = ({ children, disabled, id, onClick }: IconButtonProps) => {
  return (
    <Button disabled={disabled} id={id} type="button" onClick={onClick}>
      {children}
    </Button>
  );
};

export default IconButton;
