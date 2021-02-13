import React from 'react';
import { NAVBAR_HEIGHT } from 'src/styles/constants';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { selectNavbar } from 'src/redux/slices/navbar';
import { CenterVertically } from 'src/styles/utility';
import Button, { ButtonSizes } from '../dls/Button/Button';
import LanuageSelector from './LanguageSelector';

const Navbar = () => {
  const { isVisible } = useSelector(selectNavbar);
  return (
    <StyledNav isVisible={isVisible}>
      {isVisible && (
        <StyledItemsContainer>
          <CenterVertically>
            <LeftCTA>
              <Button iconHref="/icons/Logo.svg" size={ButtonSizes.Medium} iconAlt="logo" />
              <LanuageSelector />
            </LeftCTA>
          </CenterVertically>
          <CenterVertically>
            <RightCTA>
              <Button iconHref="/icons/user.svg" size={ButtonSizes.Small} iconAlt="profile" />
              <Button iconHref="/icons/settings.svg" size={ButtonSizes.Small} iconAlt="settings" />
              <Button iconHref="/icons/reader.svg" size={ButtonSizes.Small} iconAlt="bookmarks" />
              <Button iconHref="/icons/search.svg" size={ButtonSizes.Small} iconAlt="search" />
            </RightCTA>
          </CenterVertically>
        </StyledItemsContainer>
      )}
    </StyledNav>
  );
};

const StyledNav = styled.nav<{ isVisible: boolean }>`
  position: fixed;
  height: ${NAVBAR_HEIGHT};
  ${(props) => !props.isVisible && `transform: translateY(-${NAVBAR_HEIGHT});`}
  width: 100%;
  text-align: center;
  transition: ${(props) => props.theme.transitions.regular};
  background: ${(props) => props.theme.colors.background.default};
  z-index: ${(props) => props.theme.zIndexes.header};
  border-bottom: 1px ${(props) => props.theme.colors.borders.hairline} solid;
`;

const StyledItemsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 100%;
`;

const LeftCTA = styled.div`
  display: flex;
  margin-left: ${(props) => props.theme.spacing.medium};

  > button {
    margin-right: ${(props) => props.theme.spacing.xxsmall};
  }

  @media only screen and (min-width: ${(props) => props.theme.breakpoints.tablet}) {
    margin-left: ${(props) => `calc(1*${props.theme.spacing.mega})`};

    > button {
      margin-right: ${(props) => props.theme.spacing.medium};
    }
  }
`;
const RightCTA = styled.div`
  display: flex;
  margin-right: ${(props) => props.theme.spacing.medium};

  > button {
    margin-left: ${(props) => props.theme.spacing.micro};
  }

  @media only screen and (min-width: ${(props) => props.theme.breakpoints.tablet}) {
    margin-right: ${(props) => `calc(1*${props.theme.spacing.mega})`};

    > button {
      margin-left: ${(props) => props.theme.spacing.xsmall};
    }
  }
`;

export default Navbar;
