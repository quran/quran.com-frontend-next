/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { ReactNode, useRef, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { rgba } from 'polished';
import useOutsideClickDetector from '../../../hooks/useOutsideClickDetector';

interface Props {
  overlay: ReactNode;
  children: ReactNode | ReactNode[];
  overlayClassName?: string;
  onVisibleChange?: (visible: boolean) => void;
  visible?: boolean;
  placement?: Placement;
}

export enum Placement {
  RIGHT = 'right',
  LEFT = 'left',
  TOP = 'top',
  BOTTOM = 'bottom',
}

const PLACEMENT_MARGIN_DIRECTION = {
  [Placement.TOP]: 'bottom',
  [Placement.BOTTOM]: 'top',
  [Placement.RIGHT]: 'left',
  [Placement.LEFT]: 'right',
};

const Dropdown: React.FC<Props> = ({
  children,
  overlay,
  overlayClassName = '',
  onVisibleChange,
  visible,
  placement = Placement.BOTTOM,
}) => {
  const isVisibilityControlled = typeof visible !== 'undefined';
  const [isOpen, setIsOpen] = useState(isVisibilityControlled ? visible : false);
  const dropdownRef = useRef(null);
  const onClickOutsideDetected = useCallback(() => {
    // only close the dropdown when the dropdown visibility is not controlled and is already open.
    if (isVisibilityControlled === false && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen, isVisibilityControlled]);
  useOutsideClickDetector(dropdownRef, onClickOutsideDetected, isVisibilityControlled === false);
  useEffect(() => {
    // if the component received a visibility change callback and it's not controlled since there is no point of calling the callback if the parent component controls the visibility.
    if (!isVisibilityControlled && onVisibleChange) {
      onVisibleChange(isOpen);
    }
  }, [isOpen, onVisibleChange, isVisibilityControlled]);

  /**
   * Handle when the button element is clicked.
   *
   */
  const handleOnClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!isVisibilityControlled) {
      setIsOpen((prevIsOpen) => !prevIsOpen);
    }
  };

  return (
    <StyledContainer ref={dropdownRef}>
      <a onClick={handleOnClick} aria-hidden="true">
        {children}
      </a>
      <StyledOverlay isOpen={isOpen} className={overlayClassName} placement={placement}>
        <div>{overlay}</div>
      </StyledOverlay>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  position: relative;
  width: fit-content;
`;

const StyledOverlay = styled.div<{ isOpen: boolean; placement: Placement }>`
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  ${(props) => !props.isOpen && `visibility: hidden;`}
  position: absolute;
  background: ${({ theme }) => theme.colors.background.neutralGrey};
  transition: ${(props) => props.theme.transitions.fast};
  z-index: ${(props) => props.theme.zIndexes.dropdown};
  border: 1px solid ${({ theme }) => rgba(theme.colors.primary.medium, 0.8)};
  border-radius: 3%;
  ${(props) =>
    `margin-${PLACEMENT_MARGIN_DIRECTION[props.placement]}: ${props.theme.spacing.xxsmall};`}
  padding: ${(props) => props.theme.spacing.micro};
  ${(props) =>
    props.placement === Placement.RIGHT && `left: 100%; top: -${props.theme.spacing.medium};  `}
  ${(props) =>
    props.placement === Placement.LEFT && `right: 100%; top: -${props.theme.spacing.medium}; `}
  ${(props) => props.placement === Placement.TOP && `bottom: 100%;`}
  ${(props) => props.placement === Placement.BOTTOM && `top: 100%;`}
`;

export default Dropdown;
