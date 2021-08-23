import classNames from 'classnames';
import Link from 'next/link';
import { MouseEventHandler } from 'react';
import styles from './ButtonNew.module.scss';
import Spinner, { SpinnerSize } from './Spinner';

export enum ButtonSize {
  Small = 'small',
  Normal = 'normal',
  Large = 'large',
}

export enum ButtonShape {
  Square = 'square',
  Circle = 'circle',
}

export enum ButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Alert = 'alert',
}

export enum ButtonVariant {
  Shadow = 'shadow',
  Ghost = 'ghost',
}

type ButtonNewProps = {
  size?: ButtonSize;
  shape?: ButtonShape;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  type?: ButtonType;
  variant?: ButtonVariant;
  loading?: boolean;
  href?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler;
};

const Button: React.FC<ButtonNewProps> = ({
  href,
  onClick,
  children,
  disabled = false,
  loading,
  type = ButtonType.Primary,
  size = ButtonSize.Normal,
  shape = ButtonShape.Square,
  prefix,
  suffix,
  variant,
}) => {
  const classes = classNames(styles.base, {
    // type
    [styles.primary]: type === ButtonType.Primary,
    [styles.secondary]: type === ButtonType.Secondary,
    [styles.success]: type === ButtonType.Success,
    [styles.warning]: type === ButtonType.Warning,
    [styles.alert]: type === ButtonType.Alert,
    [styles.error]: type === ButtonType.Error,

    // size
    [styles.large]: size === ButtonSize.Large,
    [styles.normal]: size === ButtonSize.Normal,
    [styles.small]: size === ButtonSize.Small,

    // shape
    [styles.square]: shape === ButtonShape.Square,
    [styles.circle]: shape === ButtonShape.Circle,

    // variant
    [styles.shadow]: variant === ButtonVariant.Shadow,
    [styles.ghost]: variant === ButtonVariant.Ghost,

    [styles.disabled]: disabled || loading,
  });

  // when loading, replace the prefix icon with loading icon
  let prefixFinal;
  if (loading) prefixFinal = <Spinner size={SpinnerSize[size]} />;
  else prefixFinal = prefix;

  if (href && !disabled)
    return (
      <Link href={href}>
        <a className={classes}>
          {prefixFinal}
          <span>{children}</span>
          {suffix}
        </a>
      </Link>
    );

  return (
    <button type="button" className={classes} disabled={disabled} onClick={onClick}>
      {prefixFinal && <span className={styles.prefix}>{prefixFinal}</span>}
      <span>{children}</span>
      {suffix && <span className={styles.suffix}>{suffix}</span>}
    </button>
  );
};

export default Button;
