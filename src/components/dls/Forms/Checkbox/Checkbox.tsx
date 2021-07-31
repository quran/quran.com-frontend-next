import React, { ChangeEvent } from 'react';
import styled from 'styled-components';
import TickIcon from '../../../../../public/icons/tick.svg';

export enum CheckboxSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

const SIZE_MULTIPLIER = {
  [CheckboxSize.Small]: 1,
  [CheckboxSize.Medium]: 2,
  [CheckboxSize.Large]: 3,
};

interface Props {
  id: string;
  onChange: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  checked?: boolean;
  disabled?: boolean;
  label?: string;
  name?: string;
  size?: CheckboxSize;
}

const Checkbox: React.FC<Props> = ({
  checked = false,
  disabled = false,
  size = CheckboxSize.Medium,
  id,
  label,
  name,
  onChange,
}) => {
  /**
   * Handle when the value of the checkbox input changes.
   *
   * @param {ChangeEvent<HTMLInputElement>} event
   * @returns {void}
   */
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void =>
    onChange(event, event.target.checked);

  return (
    <CheckboxContainer>
      <StyledLabel htmlFor={id} disabled={disabled}>
        <CheckboxBodyContainer>
          <StyledCheckboxInput
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            id={id}
            name={name}
          />
          <IconContainer checked={checked} size={size} disabled={disabled}>
            <TickIcon />
          </IconContainer>
        </CheckboxBodyContainer>
        {label && (
          <StyledLabelText disabled={disabled} size={size}>
            {label}
          </StyledLabelText>
        )}
      </StyledLabel>
    </CheckboxContainer>
  );
};

const CheckboxBodyContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.micro};
`;

const StyledLabel = styled.label<{ disabled: boolean }>`
  display: flex;
  align-items: center;
  ${({ disabled }) => !disabled && `cursor: pointer; `}
`;

const StyledLabelText = styled.p<{ disabled: boolean; size: CheckboxSize }>`
  color: ${({ disabled, theme }) => disabled && theme.colors.secondary.medium};
  font-size: ${({ theme, size }) => `calc(${SIZE_MULTIPLIER[size]} * ${theme.fontSizes.small})`};
  transition: ${({ theme }) => theme.transitions.fast};
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;
  margin-top: ${({ theme }) => theme.spacing.micro};
  margin-bottom: ${({ theme }) => theme.spacing.micro};
  min-width: ${({ theme }) => `calc(5 * ${theme.spacing.mega})`};
`;

const StyledCheckboxInput = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  margin: 0;
  appearance: none;
  opacity: 0;
  outline: 0;
`;

const IconContainer = styled.div<{ checked: boolean; size: CheckboxSize; disabled: boolean }>`
  width: ${({ theme, size }) => `calc(${SIZE_MULTIPLIER[size]} * ${theme.spacing.xxsmall})`};
  height: ${({ theme, size }) => `calc(${SIZE_MULTIPLIER[size]} * ${theme.spacing.xxsmall})`};
  background: ${({ theme, checked, disabled }) =>
    checked && !disabled ? theme.colors.text.default : theme.colors.borders.hairline};
  transition: ${({ theme }) => theme.transitions.fast};
  > svg {
    visibility: ${({ checked }) => !checked && 'hidden'};
    display: block;
    margin: auto;
  }
`;

export default Checkbox;
