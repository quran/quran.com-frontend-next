import React, { useCallback, useRef, ReactNode, useEffect } from 'react';
import useKeyPressedDetector from 'src/hooks/useKeyPressedDetector';
import useOutsideClickDetector from 'src/hooks/useOutsideClickDetector';
import styled, { keyframes } from 'styled-components';
import Close from '../../../../public/icons/close.svg';
import Button, { ButtonSize } from '../Button/Button';

export enum ModalSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  XLarge = 'xLarge',
}

const MODAL_SIZE_VIEWPORT_WIDTH = {
  [ModalSize.Small]: 25,
  [ModalSize.Medium]: 50,
  [ModalSize.Large]: 75,
  [ModalSize.XLarge]: 90,
};

const SMALL_SCREENS_MODAL_SIZE_VIEWPORT_WIDTH = {
  [ModalSize.Small]: 70,
  [ModalSize.Medium]: 75,
  [ModalSize.Large]: 80,
  [ModalSize.XLarge]: 85,
};

const MODAL_SIZE_VIEWPORT_HEIGHT = {
  [ModalSize.Small]: 40,
  [ModalSize.Medium]: 50,
  [ModalSize.Large]: 60,
  [ModalSize.XLarge]: 70,
};

const MODAL_SIZE_BODY_HEIGHT = {
  [ModalSize.Small]: 82,
  [ModalSize.Medium]: 85,
  [ModalSize.Large]: 87,
  [ModalSize.XLarge]: 88,
};

interface Props {
  visible: boolean;
  children?: ReactNode | ReactNode[];
  onClose: () => void;
  centered?: boolean;
  showCloseIcon?: boolean;
  customCloseIcon?: ReactNode;
  canCloseByKeyboard?: boolean;
  closeWhenClickingOutside?: boolean;
  title?: ReactNode;
  size?: ModalSize;
}

const Modal: React.FC<Props> = ({
  visible,
  children,
  centered = false,
  showCloseIcon = true,
  customCloseIcon,
  canCloseByKeyboard = true,
  closeWhenClickingOutside = true,
  title,
  size = ModalSize.Medium,
  onClose,
}) => {
  const contentContainer = useRef(null);
  const handleCloseModal = useCallback(() => {
    onClose();
  }, [onClose]);
  const isEscapeKeyPressed = useKeyPressedDetector('Escape', canCloseByKeyboard);
  useOutsideClickDetector(contentContainer, handleCloseModal, closeWhenClickingOutside);

  // listen to any changes of escape key being pressed.
  useEffect(() => {
    // if we allow closing the modal by keyboard and also ESCAPE key has been pressed, we close the modal.
    if (canCloseByKeyboard && isEscapeKeyPressed === true) {
      handleCloseModal();
    }
  }, [canCloseByKeyboard, handleCloseModal, isEscapeKeyPressed]);

  return (
    <ModalContainer isOpen={visible} centered={centered}>
      <ContentContainer size={size} ref={contentContainer}>
        <HeaderContainer hasTitle={!!title}>
          {title && <div>{title}</div>}
          {showCloseIcon && (
            <Button
              icon={customCloseIcon || <Close />}
              size={ButtonSize.Small}
              onClick={handleCloseModal}
            />
          )}
        </HeaderContainer>
        <hr />
        <BodyContainer size={size}>{children}</BodyContainer>
      </ContentContainer>
    </ModalContainer>
  );
};

const HeaderContainer = styled.div<{ hasTitle: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: ${(props) => (props.hasTitle ? 'space-between' : 'flex-end')};
`;

const scaleAnimation = keyframes`
  from {
    transform: scale(0.3);
  }

  to {
    transform: scale(1);
  }
`;

const ModalContainer = styled.div<{ isOpen: boolean; centered: boolean }>`
  ${(props) => !props.isOpen && `display: none;`}
  position: fixed;
  z-index: ${({ theme }) => theme.zIndexes.modal};
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.background.fadedBlackScale};
  ${({ centered, theme }) =>
    centered
      ? 'display: flex; flex-direction: column; align-items: center;'
      : `padding-top: calc(4 * ${theme.spacing.large});`}
`;

const BodyContainer = styled.div<{ size: ModalSize }>`
  overflow: auto;
  max-height: ${({ size }) => MODAL_SIZE_BODY_HEIGHT[size]}%;
  height: ${({ size }) => MODAL_SIZE_BODY_HEIGHT[size]}%;
`;

const ContentContainer = styled.div<{ size: ModalSize }>`
  animation: ${scaleAnimation} ${(props) => props.theme.transitions.fast};
  background-color: ${({ theme }) => theme.colors.background.default};
  margin: auto;
  padding: ${({ theme }) => theme.spacing.small};
  border: 1px solid #888;
  border-radius: ${(props) => props.theme.borderRadiuses.default};
  height: ${({ size }) => `${MODAL_SIZE_VIEWPORT_HEIGHT[size]}vh`};
  max-height: ${({ size }) => `${MODAL_SIZE_VIEWPORT_HEIGHT[size]}vh`};
  width: ${({ size }) => `${MODAL_SIZE_VIEWPORT_WIDTH[size]}vw`};
  max-width: ${({ size }) => `${MODAL_SIZE_VIEWPORT_WIDTH[size]}vw`};
  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.mobileL}) {
    width: ${({ size }) => `${SMALL_SCREENS_MODAL_SIZE_VIEWPORT_WIDTH[size]}vw`};
    max-width: ${({ size }) => `${SMALL_SCREENS_MODAL_SIZE_VIEWPORT_WIDTH[size]}vw`};
  }
`;

export default Modal;
