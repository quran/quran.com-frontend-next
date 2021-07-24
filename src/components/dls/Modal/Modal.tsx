import React, { useCallback, useRef, ReactNode, useEffect } from 'react';
import useKeyPressedDetector from 'src/hooks/useKeyPressedDetector';
import useOutsideClickDetector from 'src/hooks/useOutsideClickDetector';
import styled from 'styled-components';
import Close from '../../../../public/icons/close.svg';
import Button, { ButtonSize } from '../Button/Button';

interface Props {
  visible: boolean;
  children?: ReactNode | ReactNode[];
  onClose: () => void;
  centered?: boolean;
  showCloseIcon?: boolean;
  closeIcon?: ReactNode;
  canCloseByKeyboard?: boolean;
  closeWhenClickingOutside?: boolean;
  title?: ReactNode;
  width?: number;
}

const Modal: React.FC<Props> = ({
  visible,
  children,
  centered = false,
  showCloseIcon = true,
  closeIcon,
  canCloseByKeyboard = true,
  closeWhenClickingOutside = true,
  title,
  width = 580,
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
      <ContentContainer width={width} ref={contentContainer}>
        <HeaderContainer hasTitle={!!title}>
          {title && <div>{title}</div>}
          {showCloseIcon && (
            <Button
              icon={closeIcon || <Close />}
              size={ButtonSize.Small}
              onClick={handleCloseModal}
            />
          )}
        </HeaderContainer>
        <hr />
        {children}
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

const ModalContainer = styled.div<{ isOpen: boolean; centered: boolean }>`
  ${(props) => !props.isOpen && `display: none;`}
  position: fixed;
  z-index: ${({ theme }) => theme.zIndexes.modal};
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: ${({ theme }) => theme.colors.background.fadedBlackScale};
  ${({ centered, theme }) =>
    centered
      ? 'display: flex; flex-direction: column; align-items: center;'
      : `padding-top: calc(4 * ${theme.spacing.large});`}
`;

const ContentContainer = styled.div<{ width: number }>`
  background-color: ${({ theme }) => theme.colors.background.default};
  margin: auto;
  padding: ${({ theme }) => theme.spacing.small};
  border: 1px solid #888;
  width: ${({ width }) => width}px;
`;

export default Modal;
