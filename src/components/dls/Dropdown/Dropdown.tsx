/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { ReactNode, useRef, useState, useEffect, useCallback } from 'react';
import classNames from 'classnames';
import useOutsideClickDetector from '../../../hooks/useOutsideClickDetector';
import styles from './Dropdown.module.scss';

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
    <div className={styles.container} ref={dropdownRef}>
      <a onClick={handleOnClick} aria-hidden="true">
        {children}
      </a>
      <div
        className={classNames(
          overlayClassName,
          styles.overlay,
          { [styles.open]: isOpen },
          {
            [styles.placementTop]: placement === Placement.TOP,
          },
          {
            [styles.placementBottom]: placement === Placement.BOTTOM,
          },
          {
            [styles.placementRight]: placement === Placement.RIGHT,
          },
          {
            [styles.placementLeft]: placement === Placement.LEFT,
          },
        )}
      >
        <div>{overlay}</div>
      </div>
    </div>
  );
};

export default Dropdown;
