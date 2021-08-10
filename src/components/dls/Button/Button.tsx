import React from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import styles from './Button.module.scss';

type ButtonProps = {
  size?: ButtonSize;
  text?: string;
  name?: string;
  disabled?: boolean;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  icon?: React.ReactNode;
};

export enum ButtonSize {
  XSmall = 'xsmall',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

const Button = ({ size = ButtonSize.Medium, text, disabled, href, icon, onClick }: ButtonProps) => {
  return (
    <Container disabled={disabled} size={size} href={href} onClick={onClick}>
      {icon && <div className={styles.iconContainer}>{icon}</div>}
      {text}
    </Container>
  );
};

const Container = ({ children, disabled, size, href, onClick }) => {
  // if href was passed and also the button is not disabled.
  if (href && !disabled) {
    return (
      <Link href={href} passHref>
        <a className={styles.anchor}>
          <button
            type="button"
            className={classNames(styles.styledContainer, {
              [styles.hoverableContainer]: !disabled,
              [styles.disabledContainer]: disabled,
              [styles.xsmallStyledContainer]: size === ButtonSize.XSmall,
              [styles.smallStyledContainer]: size === ButtonSize.Small,
              [styles.mediumStyledContainer]: size === ButtonSize.Medium,
              [styles.largeStyledContainer]: size === ButtonSize.Large,
            })}
          >
            {children}
          </button>
        </a>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(styles.styledContainer, {
        [styles.hoverableContainer]: !disabled,
        [styles.disabledContainer]: disabled,
        [styles.xsmallStyledContainer]: size === ButtonSize.XSmall,
        [styles.smallStyledContainer]: size === ButtonSize.Small,
        [styles.mediumStyledContainer]: size === ButtonSize.Medium,
        [styles.largeStyledContainer]: size === ButtonSize.Large,
      })}
    >
      {children}
    </button>
  );
};

export default Button;
