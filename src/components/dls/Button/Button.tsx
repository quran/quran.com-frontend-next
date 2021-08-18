import React from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import styles from './Button.module.scss';

type ButtonProps = {
  size?: ButtonSize;
  desktopSize?: ButtonSize;
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

const Container: React.FC<ButtonProps> = ({
  children,
  disabled,
  size,
  desktopSize,
  href,
  onClick,
}) => {
  const classes = {
    [styles.hoverableContainer]: !disabled,
    [styles.disabledContainer]: disabled,
    [styles.xsmallStyledContainer]: size === ButtonSize.XSmall,
    [styles.smallStyledContainer]: size === ButtonSize.Small,
    [styles.mediumStyledContainer]: size === ButtonSize.Medium,
    [styles.largeStyledContainer]: size === ButtonSize.Large,
    [styles.xsmallDesktopContainer]: desktopSize === ButtonSize.XSmall,
    [styles.smallDesktopContainer]: desktopSize === ButtonSize.Small,
    [styles.mediumDesktopContainer]: desktopSize === ButtonSize.Medium,
    [styles.largeDesktopContainer]: desktopSize === ButtonSize.Large,
  };

  // if href was passed and also the button is not disabled.
  if (href && !disabled) {
    return (
      <Link href={href} passHref>
        <a className={styles.anchor}>
          <button type="button" className={classNames(styles.styledContainer, classes)}>
            {children}
          </button>
        </a>
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classNames(styles.styledContainer, classes)}>
      {children}
    </button>
  );
};

const Button = ({
  size = ButtonSize.Medium,
  text,
  disabled,
  href,
  icon,
  onClick,
  desktopSize,
}: ButtonProps) => (
  <Container
    disabled={disabled}
    size={size}
    href={href}
    onClick={onClick}
    desktopSize={desktopSize}
  >
    {icon && <div className={styles.iconContainer}>{icon}</div>}
    {text}
  </Container>
);

export default Button;
