import React, { useCallback, useRef, ReactNode, useEffect } from 'react';
import useKeyPressedDetector from 'src/hooks/useKeyPressedDetector';
import useOutsideClickDetector from 'src/hooks/useOutsideClickDetector';
import classNames from 'classnames';
import Close from '../../../../public/icons/close.svg';
import Button, { ButtonSize, ButtonVariant } from '../Button/Button';
import styles from './Modal.module.scss';

export enum ModalSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  XLarge = 'xLarge',
}

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
    <div
      className={classNames(
        styles.container,
        { [styles.hiddenContainer]: !visible },
        { [styles.centeredContainer]: centered },
      )}
    >
      <div
        ref={contentContainer}
        className={classNames(styles.contentContainer, {
          [styles.smallContentContainer]: size === ModalSize.Small,
          [styles.mediumContentContainer]: size === ModalSize.Medium,
          [styles.largeContentContainer]: size === ModalSize.Large,
          [styles.xLargeContentContainer]: size === ModalSize.XLarge,
        })}
      >
        <div
          className={classNames(styles.headerContainer, {
            [styles.headerWithTitleContainer]: !!title,
          })}
        >
          {title && <div>{title}</div>}
          {showCloseIcon && (
            <Button
              size={ButtonSize.Small}
              variant={ButtonVariant.Ghost}
              onClick={handleCloseModal}
            >
              {customCloseIcon || <Close />}
            </Button>
          )}
        </div>
        <hr />
        <div
          className={classNames(styles.bodyContainer, {
            [styles.smallBodyContainer]: size === ModalSize.Small,
            [styles.mediumBodyContainer]: size === ModalSize.Medium,
            [styles.largeBodyContainer]: size === ModalSize.Large,
            [styles.xLargeBodyContainer]: size === ModalSize.XLarge,
          })}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
