import React, { ChangeEvent } from 'react';
import styled from 'styled-components';

export enum RadioButtonSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

const SIZE_MULTIPLIER = {
  [RadioButtonSize.Small]: 1,
  [RadioButtonSize.Medium]: 2,
  [RadioButtonSize.Large]: 3,
};

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
    <RadioButtonContainer>
      <StyledLabel htmlFor={id} disabled={disabled} checked={checked}>
        <ButtonContainer>
          <RadioInputContainer size={size} disabled={disabled} checked={checked}>
            <StyledRadioInput
              checked={checked}
              disabled={disabled}
              id={id}
              name={name}
              value={value}
              onChange={handleChange}
            />
          </RadioInputContainer>
        </ButtonContainer>
        {label && (
          <StyledLabelText disabled={disabled} size={size}>
            {label}
          </StyledLabelText>
        )}
      </StyledLabel>
    </RadioButtonContainer>
  );
};

const StyledLabel = styled.label<{ disabled: boolean; checked: boolean }>`
  display: flex;
  align-items: center;
  ${({ disabled, checked }) => !disabled && !checked && `cursor: pointer; `}
`;

const RadioInputContainer = styled.div<{
  size: RadioButtonSize;
  checked: boolean;
  disabled: boolean;
}>`
  display: block;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-style: solid;
  border-radius: ${({ theme }) => theme.borderRadiuses.circle};
  border-width: ${({ theme }) => `calc(0.75 * ${theme.spacing.xxsmall})`};
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
  width: ${({ size, theme }) => `calc(${SIZE_MULTIPLIER[size]} * ${theme.spacing.xxsmall})`};
  height: ${({ size, theme }) => `calc(${SIZE_MULTIPLIER[size]} * ${theme.spacing.xxsmall})`};
  ${({ disabled, theme }) =>
    disabled &&
    `border-color: ${theme.colors.secondary.medium}; background-color: ${theme.colors.secondary.medium};`}
`;

const StyledRadioInput = styled.input.attrs({
  type: 'radio',
})`
  position: absolute;
  margin: 0;
  appearance: none;
  opacity: 0;
  outline: 0;
`;

const ButtonContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xxsmall};
`;

const StyledLabelText = styled.p<{ disabled: boolean; size: RadioButtonSize }>`
  color: ${({ disabled, theme }) => disabled && theme.colors.secondary.medium};
  font-size: ${({ theme, size }) => `calc(${SIZE_MULTIPLIER[size]} * ${theme.fontSizes.small})`};
`;

const RadioButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;
  margin-top: ${({ theme }) => theme.spacing.micro};
  margin-bottom: ${({ theme }) => theme.spacing.micro};
  min-width: ${({ theme }) => `calc(5 * ${theme.spacing.mega})`};
`;

export default RadioButton;
