import React, { useState, useRef } from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Button, { ButtonSize } from 'src/components/dls/Button/Button';
import useElementComputedPropertyValue from 'src/hooks/useElementComputedPropertyValue';
import IconClose from '../../public/icons/close.svg';
import IconSearch from '../../public/icons/search.svg';

const Search: NextPage = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(router.query.query || '');
  // we detect whether the user is inputting a right-to-left text or not so we can change the layout accordingly
  const isRTLInput = useElementComputedPropertyValue(searchInputRef, 'direction') === 'rtl';

  /**
   * Handle when the search query is changed.
   *
   * @param {React.FormEvent<HTMLInputElement>} event
   * @returns {void}
   */
  const onSearchQueryChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const newSearchQuery = event.currentTarget.value;
    if (!newSearchQuery) {
      setSearchQuery('');
    } else {
      setSearchQuery(newSearchQuery);
    }
  };

  const onClearClicked = () => {
    setSearchQuery('');
  };

  const onSearchClicked = () => {
    // TODO: call BE with the current query params.
  };

  return (
    <StyledPage>
      <StyledPageHeader>Search</StyledPageHeader>
      <SearchInputContainer isRTLInput={isRTLInput}>
        <SearchInput
          ref={searchInputRef}
          dir="auto"
          placeholder="Search"
          onChange={onSearchQueryChange}
          value={searchQuery}
        />
        {searchQuery && (
          <Button icon={<IconClose />} size={ButtonSize.XSmall} onClick={onClearClicked} />
        )}
        <Button
          icon={<IconSearch />}
          size={ButtonSize.Small}
          disabled={!searchQuery}
          onClick={onSearchClicked}
        />
      </SearchInputContainer>
    </StyledPage>
  );
};

const StyledPageHeader = styled.p`
  font-weight: ${(props) => props.theme.fontWeights.bold};
  margin: ${({ theme }) => theme.spacing.medium} 0;
  font-size: ${(props) => props.theme.fontSizes.jumbo};
`;

const SearchInputContainer = styled.div<{ isRTLInput: boolean }>`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.borders.hairline};
  border-radius: ${({ theme }) => theme.borderRadiuses.pill};
  padding: ${({ theme }) => theme.spacing.xsmall};
  display: flex;
  flex-direction: ${({ isRTLInput }) => (isRTLInput ? 'row-reverse' : 'row')};
  align-items: center;
  justify-content: space-between;
`;

const SearchInput = styled.input.attrs({
  type: 'text',
})`
  border: 0;
  width: 90%;
  font-size: ${(props) => props.theme.fontSizes.large};
  &:focus {
    outline: none;
  }
  &:disabled {
    background: none;
  }
`;

const StyledPage = styled.div`
  padding-top: calc(2 * ${({ theme }) => theme.spacing.mega});
  margin: 0 auto;
  width: 60%;
`;

export default Search;
