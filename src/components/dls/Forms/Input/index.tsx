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
        className={classNames(styles.container, containerClassName, {
          [styles.smallContainer]: size === InputSize.Small,
          [styles.mediumContainer]: size === InputSize.Medium,
          [styles.largeContainer]: size === InputSize.Large,
          [styles.fixedWidth]: fixedWidth,
          [styles.error]: type === InputType.Error,
          [styles.success]: type === InputType.Success,
          [styles.warning]: type === InputType.Warning,
          [styles.main]: variant === InputVariant.Main,
        })}
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
          className={classNames(styles.input, {
            [styles.error]: type === InputType.Error,
            [styles.success]: type === InputType.Success,
            [styles.warning]: type === InputType.Warning,
            [styles.rtlInput]: shouldFlipOnRTL,
            [styles.disabled]: disabled,
          })}
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
