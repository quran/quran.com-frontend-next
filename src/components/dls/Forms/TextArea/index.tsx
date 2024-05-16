import React, { useState, useEffect, ChangeEvent, RefObject } from 'react';

import classNames from 'classnames';

import styles from './TextArea.module.scss';

export enum TextAreaSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

const SIZE_TO_COLS = {
  [TextAreaSize.Small]: 5,
  [TextAreaSize.Medium]: 10,
  [TextAreaSize.Large]: 25,
};

export enum TextAreaType {
  Error = 'error',
  Warning = 'warning',
  Success = 'success',
}

export enum TextAreaVariant {
  Default = 'default',
  Main = 'main',
}
interface Props {
  id: string;
  name?: string;
  placeholder?: string;
  fieldSetLegend?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  value?: string;
  label?: string | JSX.Element;
  type?: TextAreaType;
  size?: TextAreaSize;
  shouldFlipOnRTL?: boolean;
  variant?: TextAreaVariant;
  containerClassName?: string;
  isRequired?: boolean;
  inputRef?: RefObject<HTMLTextAreaElement>;
}

const TextArea: React.FC<Props> = ({
  id,
  name,
  label,
  placeholder,
  disabled = false,
  type,
  variant,
  onChange,
  value = '',
  shouldFlipOnRTL = true,
  containerClassName,
  isRequired,
  inputRef,
  size = TextAreaSize.Medium,
  fieldSetLegend = null,
}) => {
  const [inputValue, setTextAreaValue] = useState(value);
  // listen to any change in value in-case the value gets populated after an API call.
  useEffect(() => {
    setTextAreaValue(value);
  }, [value]);

  const onValueChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setTextAreaValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const content = (
    <>
      {label && <p className={styles.label}>{label}</p>}
      <div
        className={classNames(styles.container, containerClassName, {
          [styles.disabled]: disabled,
          [styles.error]: type === TextAreaType.Error,
          [styles.success]: type === TextAreaType.Success,
          [styles.warning]: type === TextAreaType.Warning,
          [styles.main]: variant === TextAreaVariant.Main,
        })}
      >
        <textarea
          className={classNames(styles.input, {
            [styles.error]: type === TextAreaType.Error,
            [styles.success]: type === TextAreaType.Success,
            [styles.warning]: type === TextAreaType.Warning,
            [styles.rtlTextArea]: shouldFlipOnRTL,
          })}
          required={isRequired}
          dir="auto"
          id={id}
          rows={SIZE_TO_COLS[size]}
          ref={inputRef}
          disabled={disabled}
          onChange={onValueChange}
          value={inputValue}
          {...(placeholder && { placeholder })}
          {...(name && { name })}
        />
      </div>
    </>
  );

  if (fieldSetLegend) {
    return (
      <fieldset>
        <legend> {fieldSetLegend} </legend>
        {content}
      </fieldset>
    );
  }

  return content;
};

export default TextArea;
