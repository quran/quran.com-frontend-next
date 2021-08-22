type ButtonNewProps = {
  size?: 'small' | 'normal' | 'large';
  shape?: 'square' | 'circle';
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  align?: 'start' | 'grow';
  type?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'alert';
  variant?: 'shadow' | 'ghost';
  loading?: boolean;
  href?: string;
  disabled?: boolean;
  width?: number;
};

const Button: React.FC<ButtonNewProps> = ({ href, children, disabled }) => {
  if (href && !disabled) return <a>{children}</a>;

  return <button type="button">{children}</button>;
};

export default Button;
