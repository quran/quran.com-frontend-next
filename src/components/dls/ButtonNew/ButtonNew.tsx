import Link from 'next/link';

enum ButtonSize {
  Small = 'small',
  Normal = 'normal',
  Large = 'Large',
}

enum ButtonShape {
  Square = 'square',
  Circle = 'circle',
}

enum ButtonAlign {
  Start = 'start',
  Grow = 'grow',
}

enum ButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Alert = 'alert',
}

enum ButtonVariant {
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

const Button: React.FC<ButtonNewProps> = ({ href, children, disabled }) => {
  if (href && !disabled)
    return (
      <Link href={href}>
        <a>{children}</a>;
      </Link>
    );

  return <button type="button">{children}</button>;
};

export default Button;
