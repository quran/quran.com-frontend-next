import React, { ReactNode, useState, useEffect, ChangeEvent } from 'react';

import classNames from 'classnames';

import ClearIcon from '../../../../../public/icons/close.svg';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../../Button/Button';

import styles from './Input.module.scss';

export enum InputSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

export enum InputType {
  Error = 'error',
  Warning = 'warning',
  Success = 'success',
}

export enum InputVariant {
  Default = 'default',
  Main = 'main',
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
  value?: string;
  label?: string;
  type?: InputType;
  shouldFlipOnRTL?: boolean;
  variant?: InputVariant;
  containerClassName?: string;
  htmlType?: React.HTMLInputTypeAttribute;
  isRequired?: boolean;
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
  value = '',
  shouldFlipOnRTL = true,
  containerClassName,
  htmlType,
  isRequired,
}) => {
  const [inputValue, setInputValue] = useState(value);
  // listen to any change in value in-case the value gets populated after and API call.
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const onValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <>
      {label && <p className={styles.label}>{label}</p>}
      <div
        className={classNames(styles.container, containerClassName, {
          [styles.smallContainer]: size === InputSize.Small,
          [styles.mediumContainer]: size === InputSize.Medium,
          [styles.largeContainer]: size === InputSize.Large,
          [styles.fixedWidth]: fixedWidth,
          [styles.disabled]: disabled,
          [styles.error]: type === InputType.Error,
          [styles.success]: type === InputType.Success,
          [styles.warning]: type === InputType.Warning,
          [styles.main]: variant === InputVariant.Main,
        })}
      >
        {prefix && (
          <div className={classNames(styles.prefix, styles.prefixSuffixContainer)}>{prefix}</div>
        )}
        <input
          className={classNames(styles.input, {
            [styles.error]: type === InputType.Error,
            [styles.success]: type === InputType.Success,
            [styles.warning]: type === InputType.Warning,
            [styles.rtlInput]: shouldFlipOnRTL,
          })}
          type={htmlType}
          required={isRequired}
          dir="auto"
          id={id}
          disabled={disabled}
          onChange={onValueChange}
          value={inputValue}
          {...(placeholder && { placeholder })}
          {...(name && { name })}
        />
        {clearable ? (
          <>
            {inputValue && (
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
            )}
          </>
        ) : (
          <>
            {suffix && (
              <div className={classNames(styles.suffix, styles.prefixSuffixContainer)}>
                {suffix}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Input;
