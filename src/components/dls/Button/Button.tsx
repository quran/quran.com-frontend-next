/* eslint-disable max-lines */
import React, { MouseEventHandler, ButtonHTMLAttributes } from 'react';

import classNames from 'classnames';

import styles from './Button.module.scss';

import Wrapper from '@/components/Wrapper/Wrapper';
import Link from '@/dls/Link/Link';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import Tooltip, { ContentSide } from '@/dls/Tooltip';
import useDirection from '@/hooks/useDirection';

export enum ButtonSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

export enum ButtonShape {
  Square = 'square',
  Circle = 'circle',
  Pill = 'pill',
}

/**
 * Button type defines the semantic purpose and color scheme of the button.
 * Different types have their own themed colors (background, foreground, border).
 */
export enum ButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Inverse = 'inverse',
}

/**
 * Button variant modifies the visual style and behavior of the button type.
 * Some variants override type colors, so not all type+variant combinations are compatible.
 *
 * Compatible combinations:
 * - Shadow: Works with all types (adds elevation)
 * - Ghost: Works with all types (transparent background, uses type colors)
 * - Compact: Works with all types (minimal padding, transparent background)
 * - Outlined: Works with all types (outlined style with type colors)
 * - Simplified: Best with Primary/Secondary/Inverse (uses fixed teal color, conflicts with Success/Warning/Error)
 * - SimplifiedAccent: Best with Primary/Secondary/Inverse (uses success green, conflicts with Success/Warning/Error)
 * - Accent: Best with Primary/Secondary/Inverse (uses success green, conflicts with Success/Warning/Error)
 */
export enum ButtonVariant {
  Shadow = 'shadow',
  Ghost = 'ghost',
  Compact = 'compact',
  Outlined = 'outlined',
  Simplified = 'simplified',
  SimplifiedAccent = 'simplified_accent',
  Accent = 'accent',
}

/**
 * Defines incompatible type+variant combinations that should not be used together.
 * These combinations can cause conflicting color classes to be applied simultaneously.
 *
 * Supported combinations:
 * - Accent/SimplifiedAccent variants work best with Primary or no type (uses success colors)
 * - Simplified variant works best with Primary or no type (uses teal color)
 * - Ghost/Outlined/Compact variants work with all types (they modify the type's colors)
 * - Shadow variant works with all types (adds elevation without color conflict)
 */
const INCOMPATIBLE_COMBINATIONS: Record<ButtonVariant, ButtonType[]> = {
  [ButtonVariant.Accent]: [ButtonType.Success, ButtonType.Warning, ButtonType.Error],
  [ButtonVariant.SimplifiedAccent]: [ButtonType.Success, ButtonType.Warning, ButtonType.Error],
  [ButtonVariant.Simplified]: [ButtonType.Success, ButtonType.Warning, ButtonType.Error],
  [ButtonVariant.Shadow]: [],
  [ButtonVariant.Ghost]: [],
  [ButtonVariant.Compact]: [],
  [ButtonVariant.Outlined]: [],
};

/**
 * Validates that the type and variant combination is compatible.
 * Logs a warning in development mode if an incompatible combination is detected.
 *
 * @returns {{ isValid: boolean; safeType: ButtonType; safeVariant?: ButtonVariant }} Object containing isValid flag, safeType (falls back to Primary if incompatible), and safeVariant
 */
const validateTypeVariantCombination = (
  type: ButtonType,
  variant?: ButtonVariant,
): { isValid: boolean; safeType: ButtonType; safeVariant?: ButtonVariant } => {
  if (!variant) {
    return { isValid: true, safeType: type, safeVariant: variant };
  }

  const incompatibleTypes = INCOMPATIBLE_COMBINATIONS[variant] || [];
  const isIncompatible = incompatibleTypes.includes(type);

  if (isIncompatible && process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.warn(
      `[Button] Incompatible combination detected: type="${type}" with variant="${variant}". ` +
        `This combination may cause conflicting color classes. ` +
        `Falling back to type="primary". ` +
        `Supported types for ${variant}: ${Object.values(ButtonType)
          .filter((t) => !incompatibleTypes.includes(t))
          .join(', ')}`,
    );
  }

  return {
    isValid: !isIncompatible,
    safeType: isIncompatible ? ButtonType.Primary : type,
    safeVariant: variant,
  };
};

export type ButtonProps = {
  size?: ButtonSize;
  shape?: ButtonShape;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  type?: ButtonType;
  variant?: ButtonVariant;
  isLoading?: boolean;
  href?: string;
  isDisabled?: boolean;
  onClick?: MouseEventHandler;
  tooltip?: string | React.ReactNode;
  tooltipContentSide?: ContentSide;
  className?: string;
  contentClassName?: string;
  hasSidePadding?: boolean;
  shouldFlipOnRTL?: boolean;
  shouldShallowRoute?: boolean;
  shouldPrefetch?: boolean;
  isNewTab?: boolean;
  ariaLabel?: string;
  htmlType?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  children?: React.ReactNode;
  id?: string;
};

const Button: React.FC<ButtonProps> = ({
  href,
  onClick,
  children,
  isDisabled: disabled = false,
  isLoading,
  type = ButtonType.Primary,
  size = ButtonSize.Medium,
  shape,
  prefix,
  suffix,
  variant,
  tooltip,
  tooltipContentSide = ContentSide.BOTTOM,
  className,
  contentClassName,
  hasSidePadding = true,
  shouldFlipOnRTL = true,
  shouldShallowRoute: shallowRouting = false,
  shouldPrefetch: prefetch = true,
  isNewTab: newTab,
  ariaLabel,
  htmlType,
  ...props
}) => {
  // Validate type+variant combination and use safe values
  const { safeType } = validateTypeVariantCombination(type, variant);
  const direction = useDirection();
  const classes = classNames(styles.base, className, {
    [styles.withText]: typeof children === 'string',
    [styles.withIcon]: typeof children !== 'string',
    // type
    [styles.primary]: safeType === ButtonType.Primary,
    [styles.secondary]: safeType === ButtonType.Secondary,
    [styles.success]: safeType === ButtonType.Success,
    [styles.warning]: safeType === ButtonType.Warning,
    [styles.error]: safeType === ButtonType.Error,
    [styles.inverse]: safeType === ButtonType.Inverse,

    // size
    [styles.large]: size === ButtonSize.Large,
    [styles.normal]: size === ButtonSize.Medium,
    [styles.small]: size === ButtonSize.Small,

    // shape
    [styles.square]: shape === ButtonShape.Square,
    [styles.circle]: shape === ButtonShape.Circle,
    [styles.pill]: shape === ButtonShape.Pill,

    // variant
    [styles.shadow]: variant === ButtonVariant.Shadow,
    [styles.ghost]: variant === ButtonVariant.Ghost,
    [styles.compact]: variant === ButtonVariant.Compact,
    [styles.outlined]: variant === ButtonVariant.Outlined,
    [styles.simplified]: variant === ButtonVariant.Simplified,
    [styles.simplified_accent]: variant === ButtonVariant.SimplifiedAccent,
    [styles.accent]: variant === ButtonVariant.Accent,
    [styles.disabled]: disabled || isLoading,
    [styles.noSidePadding]: !hasSidePadding,
  });

  // when loading, replace the prefix icon with loading icon
  let prefixFinal;
  if (isLoading) prefixFinal = <Spinner size={size.toString() as SpinnerSize} />;
  else prefixFinal = prefix;

  let content;

  if (href && !disabled) {
    content = (
      <Link
        href={href}
        isNewTab={newTab}
        shouldPrefetch={prefetch}
        isShallow={shallowRouting}
        {...(onClick && { onClick })}
        // eslint-disable-next-line @typescript-eslint/naming-convention
        {...(ariaLabel && { ariaLabel })}
      >
        <div dir={direction} className={classes} data-auto-flip-icon={shouldFlipOnRTL} {...props}>
          {prefixFinal && (
            <span dir={direction} className={styles.prefix} data-auto-flip-icon={shouldFlipOnRTL}>
              {prefixFinal}
            </span>
          )}
          <span className={classNames(styles.content, contentClassName)}>{children}</span>
          {suffix && (
            <span dir={direction} className={styles.suffix} data-auto-flip-icon={shouldFlipOnRTL}>
              {suffix}
            </span>
          )}
        </div>
      </Link>
    );
  } else {
    content = (
      <button
        // eslint-disable-next-line react/button-has-type
        type={htmlType}
        dir={direction}
        className={classes}
        disabled={disabled}
        onClick={onClick}
        data-auto-flip-icon={shouldFlipOnRTL}
        // eslint-disable-next-line @typescript-eslint/naming-convention
        {...(ariaLabel && { 'aria-label': ariaLabel })}
        {...props}
      >
        {prefixFinal && (
          <span dir={direction} className={styles.prefix} data-auto-flip-icon={shouldFlipOnRTL}>
            {prefixFinal}
          </span>
        )}
        <span className={classNames(styles.content, contentClassName)}>{children}</span>
        {suffix && (
          <span dir={direction} className={styles.suffix} data-auto-flip-icon={shouldFlipOnRTL}>
            {suffix}
          </span>
        )}
      </button>
    );
  }

  return (
    <Wrapper
      shouldWrap={!!tooltip}
      wrapper={(tooltipChildren) => (
        <Tooltip text={tooltip} contentSide={tooltipContentSide}>
          {tooltipChildren}
        </Tooltip>
      )}
    >
      {content}
    </Wrapper>
  );
};

export default Button;
