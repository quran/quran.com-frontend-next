/* eslint-disable max-lines */
import React, {
  ReactNode,
  useState,
  useEffect,
  ChangeEvent,
  RefObject,
  KeyboardEvent,
  HTMLAttributes,
  InputHTMLAttributes,
} from 'react';

import classNames from 'classnames';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../../Button/Button';

import styles from './Input.module.scss';
import InputSuffix from './Suffix';

import ClearIcon from '@/icons/close.svg';

export enum InputSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  XLarge = 'xlarge',
}

export enum InputType {
  Error = 'error',
  Warning = 'warning',
  Success = 'success',
  AuthForm = 'authForm',
}

export enum InputVariant {
  Default = 'default',
  Main = 'main',
  AuthForm = 'authForm',
}
interface Props {
  id: string;
  name?: string;
  size?: InputSize;
  placeholder?: string;
  fixedWidth?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  onClearClicked?: () => void;
  onChange?: (value: string) => void;
  onClick?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  enterKeyHint?: InputHTMLAttributes<HTMLInputElement>['enterKeyHint'];
  value?: string;
  label?: string | JSX.Element;
  type?: InputType;
  shouldFlipOnRTL?: boolean;
  variant?: InputVariant;
  containerClassName?: string;
  htmlType?: React.HTMLInputTypeAttribute;
  isRequired?: boolean;
  inputRef?: RefObject<HTMLInputElement>;
  prefixSuffixContainerClassName?: string;
  shouldUseDefaultStyles?: boolean;
}

const Input: React.FC<Props> = ({
  id,
  name,
  label,
  placeholder,
  size = InputSize.Medium,
  fixedWidth = true,
  disabled = false,
  clearable = false,
  type,
  variant,
  prefix,
  suffix,
  onClearClicked,
  onChange,
  onKeyDown,
  onClick,
  inputMode,
  enterKeyHint,
  value = '',
  shouldFlipOnRTL = true,
  containerClassName,
  prefixSuffixContainerClassName,
  htmlType,
  isRequired,
  inputRef,
  shouldUseDefaultStyles = true,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [actualSize, setActualSize] = useState<InputSize>(
    variant === InputVariant.AuthForm ? InputSize.XLarge : size,
  );
  const [actualType, setActualType] = useState<InputType | undefined>(
    variant === InputVariant.AuthForm ? InputType.AuthForm : type,
  );
  // listen to any change in value in-case the value gets populated after and API call.
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    setActualSize(variant === InputVariant.AuthForm ? InputSize.XLarge : size);
    setActualType(variant === InputVariant.AuthForm ? InputType.AuthForm : type);
  }, [size, type, variant]);

  const onValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // eslint-disable-next-line react/no-multi-comp
  const Suffix = () => (
    <>
      {suffix && (
        <InputSuffix
          suffix={suffix}
          suffixContainerClassName={styles.prefixSuffixContainer}
          shouldUseDefaultStyles={shouldUseDefaultStyles}
        />
      )}
    </>
  );

  return (
    <>
      {label && <p className={styles.label}>{label}</p>}
      <div
        className={classNames(
          // Apply the appropriate container class based on variant and size
          {
            // For auth forms, use auth container
            [styles.authContainer]: variant === InputVariant.AuthForm,
            // For non-auth forms, apply size-specific container
            ...(variant !== InputVariant.AuthForm && {
              [styles.smallContainer]: actualSize === InputSize.Small,
              [styles.mediumContainer]: actualSize === InputSize.Medium,
              [styles.largeContainer]: actualSize === InputSize.Large,
            }),
          },
          // Apply width classes
          {
            [styles.fixedWidth]: fixedWidth,
            [styles.fullWidth]: variant === InputVariant.AuthForm, // Apply full width for auth forms
          },
          // Apply status classes based on type
          {
            [styles.error]: actualType === InputType.Error,
            [styles.success]: actualType === InputType.Success,
            [styles.warning]: actualType === InputType.Warning,
            [styles.authForm]: actualType === InputType.AuthForm,
          },
          // Apply main variant class
          { [styles.main]: variant === InputVariant.Main },
          // Apply custom container class if provided
          containerClassName,
        )}
      >
        {prefix && (
          <div
            className={classNames(
              styles.prefix,
              styles.prefixSuffixContainer,
              prefixSuffixContainerClassName,
            )}
          >
            {prefix}
          </div>
        )}
        <input
          onClick={handleClick}
          className={classNames(
            // Apply the appropriate input class based on variant
            {
              // For auth forms, use auth input
              [styles.authInput]: variant === InputVariant.AuthForm,
              // For non-auth forms, use regular input
              [styles.input]: variant !== InputVariant.AuthForm,
            },
            // Apply status classes based on type
            {
              [styles.error]: actualType === InputType.Error,
              [styles.success]: actualType === InputType.Success,
              [styles.warning]: actualType === InputType.Warning,
              [styles.authForm]: actualType === InputType.AuthForm,
            },
            // Always apply these classes regardless of variant
            {
              [styles.rtlInput]: shouldFlipOnRTL,
              [styles.disabled]: disabled,
            },
          )}
          type={htmlType}
          required={isRequired}
          dir="auto"
          id={id}
          ref={inputRef}
          disabled={disabled}
          onChange={onValueChange}
          value={inputValue}
          onKeyDown={onKeyDown}
          inputMode={inputMode}
          enterKeyHint={enterKeyHint}
          {...(placeholder && { placeholder })}
          {...(name && { name })}
        />
        {clearable ? (
          <>
            {inputValue ? (
              <div className={styles.clearContainer}>
                <Button
                  shape={ButtonShape.Circle}
                  variant={ButtonVariant.Ghost}
                  size={ButtonSize.Small}
                  onClick={onClearClicked}
                >
                  <ClearIcon />
                </Button>
              </div>
            ) : (
              <Suffix />
            )}
          </>
        ) : (
          <Suffix />
        )}
      </div>
    </>
  );
};

export default Input;
