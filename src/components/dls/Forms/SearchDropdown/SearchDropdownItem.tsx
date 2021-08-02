import React, { RefObject, ChangeEvent, memo } from 'react';
import styled from 'styled-components';

export interface DropdownItem {
  id: string;
  value: string;
  name: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
}

interface Props {
  checked: boolean;
  disabled: boolean;
  itemId?: string;
  selectedItemRef?: RefObject<HTMLDivElement>;
  item?: DropdownItem;
  onItemSelected?: (event: ChangeEvent<HTMLInputElement>) => void;
  isNotFound?: boolean;
  noResultText?: string;
}

const SearchDropdownItem: React.FC<Props> = ({
  checked,
  disabled,
  itemId,
  selectedItemRef,
  item,
  onItemSelected,
  isNotFound = false,
  noResultText,
}) => {
  if (isNotFound) {
    return (
      <ItemContainer checked={false} disabled>
        {noResultText}
      </ItemContainer>
    );
  }
  return (
    <label htmlFor={itemId} key={itemId}>
      <ItemContainer checked={checked} disabled={disabled} ref={checked ? selectedItemRef : null}>
        <StyledInput
          id={itemId}
          name={item.name}
          disabled={disabled}
          checked={checked}
          onChange={onItemSelected}
        />
        <ItemLabel htmlFor={itemId} disabled={disabled}>
          {item.label}
        </ItemLabel>
      </ItemContainer>
    </label>
  );
};

const StyledInput = styled.input.attrs({
  type: 'radio',
})`
  display: none;
`;

const ItemLabel = styled.label<{ disabled: boolean }>`
  ${({ disabled }) => !disabled && `cursor: pointer; `}
`;

const ItemContainer = styled.div<{ checked: boolean; disabled: boolean }>`
  padding: ${({ theme }) => theme.spacing.xxsmall};
  ${({ disabled, theme }) =>
    !disabled &&
    `cursor: pointer; 
    &:hover {
      background: ${theme.colors.borders.hairline};
    }`}
  ${({ disabled, theme }) => disabled && `color: ${disabled && theme.colors.secondary.medium};`}
  ${({ checked, theme }) => checked && `background: ${theme.colors.borders.hairline};`}
`;

export default memo(SearchDropdownItem);
