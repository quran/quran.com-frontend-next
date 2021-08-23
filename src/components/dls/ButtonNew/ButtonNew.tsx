import classNames from 'classnames';
import Link from 'next/link';
import styles from './ButtonNew.module.scss';

export enum ButtonSize {
  Small = 'small',
  Normal = 'normal',
  Large = 'Large',
}

export enum ButtonShape {
  Square = 'square',
  Circle = 'circle',
}

export enum ButtonAlign {
  Start = 'start',
  Grow = 'grow',
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
  align?: ButtonAlign;
  type?: ButtonType;
  variant?: ButtonVariant;
  loading?: boolean;
  href?: string;
  disabled?: boolean;
};

const Button: React.FC<ButtonNewProps> = ({
  href,
  children,
  disabled = false,
  type = ButtonType.Primary,
  size = ButtonSize.Normal,
}) => {
  const classes = classNames(styles.base, {
    // type
    [styles.primary]: type === ButtonType.Primary,
    [styles.secondary]: type === ButtonType.Secondary,
    [styles.warning]: type === ButtonType.Warning,
    [styles.alert]: type === ButtonType.Alert,
    [styles.success]: type === ButtonType.Secondary,
    [styles.error]: type === ButtonType.Error,

    // size
    [styles.large]: size === ButtonSize.Large,
    [styles.normal]: size === ButtonSize.Normal,
    [styles.small]: size === ButtonSize.Small,

    //
  });

  if (href && !disabled)
    return (
      <Link href={href}>
        <a className={classes}>{children}</a>;
      </Link>
    );

  return (
    <button type="button" className={classes}>
      {children}
    </button>
  );
};

export default Button;
