import React, { ChangeEvent, useState, ReactNode } from 'react';
import styled from 'styled-components';
import CaretIcon from '../../../../../public/icons/caret-up.svg';
import CloseIcon from '../../../../../public/icons/close.svg';
import Button, { ButtonSize } from '../../Button/Button';

export enum SearchDropdownSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

const SIZE_MULTIPLIER = {
  [SearchDropdownSize.Small]: 5,
  [SearchDropdownSize.Medium]: 8,
  [SearchDropdownSize.Large]: 11,
};
interface SearchDropdownOption {
  id: string;
  value: string;
  name: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
}

interface Props {
  onSelect: (selectedName: string, dropDownIdId: string) => void;
  selectorText: string;
  options: SearchDropdownOption[];
  id: string;
  noResultText?: string;
  label?: string | ReactNode;
  searchPlaceHolder?: string;
  size?: SearchDropdownSize;
  selectedOption?: string;
  showClearSearchIcon?: boolean;
  allowSearching?: boolean;
}

const SearchDropdown: React.FC<Props> = ({
  options,
  searchPlaceHolder = 'Type search query...',
  selectorText,
  selectedOption,
  allowSearching = true,
  showClearSearchIcon = true,
  noResultText = 'No results found.',
  label,
  id,
  size = SearchDropdownSize.Medium,
  onSelect,
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredOptions, setFilteredOptions] = useState<SearchDropdownOption[]>(options);

  const onSelectorClicked = () => {
    setIsOpened((prevIsOpened) => !prevIsOpened);
  };

  /**
   * Handle when an option is selected.
   *
   * @param {ChangeEvent<HTMLInputElement>} event
   */
  const onOptionSelected = (event: ChangeEvent<HTMLInputElement>) => {
    // we will pass the name of the selected option and the id of the whole search dropdown to avoid collision in-case we have the same name but for 2 different search dropdowns.
    onSelect(event.target.name, id);
    setIsOpened(false);
  };

  /**
   * Handle when the user searches for an option.
   *
   * @param {React.FormEvent<HTMLInputElement>} event
   * @returns {void}
   */
  const onSearchQueryChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const newSearchQuery = event.currentTarget.value;
    // if the search query is empty it means it has been cleared so we set the original options back.
    setFilteredOptions(
      newSearchQuery === ''
        ? options
        : options.filter((option) => {
            // we convert the search query and the option's label to lowercase first then check if the label contains a part/all of the search query.
            return option.label.toLowerCase().includes(newSearchQuery.toLowerCase());
          }),
    );
    setSearchQuery(newSearchQuery);
  };

  const onClearButtonClicked = () => {
    setSearchQuery('');
    setFilteredOptions(options);
  };

  return (
    <>
      {label && <StyledLabel>{label}</StyledLabel>}
      <SearchDropdownContainer size={size}>
        <SelectorContainer onClick={onSelectorClicked}>
          {selectorText}
          <Button icon={<StyledCaretIcon isOpened={isOpened} />} size={ButtonSize.XSmall} />
        </SelectorContainer>
        <SearchDropdownBodyContainer isOpened={isOpened}>
          {allowSearching && (
            <SearchInputContainer>
              <SearchInput
                placeholder={searchPlaceHolder}
                isOpened={isOpened}
                onChange={onSearchQueryChange}
                value={searchQuery}
              />
              {showClearSearchIcon && (
                <Button
                  icon={<CloseIcon />}
                  size={ButtonSize.XSmall}
                  onClick={onClearButtonClicked}
                />
              )}
            </SearchInputContainer>
          )}
          <OptionsContainer isOpened={isOpened}>
            {filteredOptions.map((option) => {
              const checked = selectedOption && selectedOption === option.name;
              const disabled = option.disabled || false;
              const optionId = `${id}-${option.id}`;
              return (
                <label htmlFor={optionId}>
                  <OptionContainer key={optionId} checked={checked} disabled={disabled}>
                    <StyledInput
                      id={optionId}
                      name={option.name}
                      disabled={disabled}
                      checked={checked}
                      onChange={onOptionSelected}
                    />
                    <OptionLabel htmlFor={optionId} disabled={disabled}>
                      {option.label}
                    </OptionLabel>
                  </OptionContainer>
                </label>
              );
            })}
            {!filteredOptions.length && (
              <OptionContainer checked={false} disabled>
                {noResultText}
              </OptionContainer>
            )}
          </OptionsContainer>
        </SearchDropdownBodyContainer>
      </SearchDropdownContainer>
    </>
  );
};

const StyledLabel = styled.p`
  padding-top: ${({ theme }) => theme.spacing.micro};
  padding-bottom: ${({ theme }) => theme.spacing.micro};
`;

const SearchDropdownContainer = styled.div<{ size: SearchDropdownSize }>`
  display: flex;
  width: ${({ theme, size }) => `calc(${SIZE_MULTIPLIER[size]}* ${theme.spacing.mega})`};
  flex-direction: column;
  position: relative;
`;

const SelectorContainer = styled.div`
  justify-content: space-between;
  display: flex;
  align-items: center;
  height: ${({ theme }) => theme.spacing.mega};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadiuses.default};
  border: ${({ theme }) => `1px solid ${theme.colors.borders.hairline}`};
  padding-right: ${({ theme }) => theme.spacing.micro};
  padding-left: ${({ theme }) => theme.spacing.micro};
`;

const SearchDropdownBodyContainer = styled.div<{ isOpened: boolean }>`
  position: absolute;
  margin-top: ${({ theme }) => `calc(${theme.spacing.mega} + 3 * ${theme.spacing.micro})`};
  width: 100%;
  z-index: ${({ theme }) => theme.zIndexes.dropdown};
  transition: ${({ theme }) => theme.transitions.regular};
  background-color: ${({ theme }) => theme.colors.background.default};
  ${({ isOpened }) =>
    isOpened
      ? `opacity: 1; pointer-events: auto;`
      : `visibility: hidden; opacity: 0; pointer-events: none;`}
`;

const StyledCaretIcon = styled(CaretIcon)<{ isOpened: boolean }>`
  ${({ isOpened }) => isOpened && 'transform: rotateX(180deg);'}
  transition: ${({ theme }) => theme.transitions.regular};
`;

const SearchInputContainer = styled.div`
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.background.default};
  display: flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.borderRadiuses.default};
  border: ${({ theme }) => `1px solid ${theme.colors.borders.hairline}`};
  margin-bottom: ${({ theme }) => theme.spacing.micro};
  height: ${({ theme }) => theme.spacing.mega};
`;

const SearchInput = styled.input.attrs({
  type: 'text',
})<{ isOpened: boolean }>`
  width: 100%;
  border: 0;
  &:focus {
    outline: none;
  }
`;

const OptionsContainer = styled.div<{ isOpened: boolean }>`
  border-radius: ${({ theme }) => theme.borderRadiuses.default};
  border: 1px solid ${({ theme }) => theme.colors.borders.hairline};
  overflow: hidden;
  max-height: ${({ theme }) => `calc(5*${theme.spacing.mega})`};
  overflow-y: scroll;
`;

const OptionContainer = styled.div<{ checked: boolean; disabled: boolean }>`
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

const StyledInput = styled.input.attrs({
  type: 'radio',
})`
  display: none;
`;

const OptionLabel = styled.label<{ disabled: boolean }>`
  ${({ disabled }) => !disabled && `cursor: pointer; `}
`;

export default SearchDropdown;
