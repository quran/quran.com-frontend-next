import React, { ChangeEvent } from 'react';
import styled from 'styled-components';
import classNames from 'classnames';
import styles from './RadioButton.module.scss';

export enum RadioButtonSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

interface Props {
  id: string;
  onChange: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  checked?: boolean;
  disabled?: boolean;
  label?: string;
  name?: string;
  value?: string;
  size?: RadioButtonSize;
}

const RadioButton: React.FC<Props> = ({
  checked = false,
  disabled = false,
  size = RadioButtonSize.Medium,
  id,
  label,
  name,
  onChange,
  value,
}) => {
  /**
   * Handle when the value of the radio input changes.
   *
   * @param {ChangeEvent<HTMLInputElement>} event
   * @returns {void}
   */
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void =>
    onChange(event, event.target.checked);

  return (
    <div className={styles.container}>
      <label
        htmlFor={id}
        className={classNames(styles.label, { [styles.disabled]: disabled || checked })}
      >
        <div className={styles.buttonContainer}>
          <RadioInputContainer
            size={size}
            disabled={disabled}
            checked={checked}
            className={classNames(styles.inputContainer, {
              [styles.smallInputContainer]: size === RadioButtonSize.Small,
              [styles.mediumInputContainer]: size === RadioButtonSize.Medium,
              [styles.largeInputContainer]: size === RadioButtonSize.Large,
            })}
          >
            <input
              type="radio"
              checked={checked}
              disabled={disabled}
              className={styles.input}
              id={id}
              name={name}
              value={value}
              onChange={handleChange}
            />
          </RadioInputContainer>
        </div>
        {label && (
          <p
            className={classNames({
              [styles.smallLabelText]: size === RadioButtonSize.Small,
              [styles.mediumLabelText]: size === RadioButtonSize.Medium,
              [styles.largeLabelText]: size === RadioButtonSize.Large,
              [styles.disabledLabelText]: disabled,
            })}
          >
            {label}
          </p>
        )}
      </label>
    </div>
  );
};

const RadioInputContainer = styled.div<{
  size: RadioButtonSize;
  checked: boolean;
  disabled: boolean;
}>`
  ${({ disabled, checked, theme }) =>
    !disabled &&
    !checked &&
    `
    border-color: ${theme.colors.borders.hairline};
    &:hover {
      border-color: ${theme.colors.text.default};
    }`}
  ${({ checked, disabled, theme }) =>
    !disabled && checked && `border-color: ${theme.colors.text.default};`}
  ${({ disabled, theme }) =>
    disabled &&
    `border-color: ${theme.colors.secondary.medium}; background-color: ${theme.colors.secondary.medium};`}
`;

export default RadioButton;
